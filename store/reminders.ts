import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Reminder, ReminderStatus, ReminderType } from '../constants/reminderTypes';
import {
  cancelAllForReminder,
  cancelNotificationId,
  scheduleCriticalRepeat,
  scheduleNotificationsForReminder,
} from '../lib/notifications';
import { getNextDueDate } from '../lib/recurrence';
import { logger } from '../lib/logger';

import {
  deleteReminderFromCloud,
  syncReminderToCloud,
} from '../lib/sync';
import { validateReminderInput } from '../lib/validation';

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface RemindersState {
  reminders: Reminder[];
  addReminder: (input: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'notificationIds'>) => Promise<void>;
  updateReminder: (id: string, patch: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes: number) => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;
  setCriticalRepeatId: (id: string, criticalRepeatNotificationId: string | undefined) => void;
}

async function reschedule(reminder: Reminder): Promise<Reminder> {
  await cancelAllForReminder(reminder);
  const { notificationIds, criticalRepeatNotificationId } =
    await scheduleNotificationsForReminder(reminder);
  return {
    ...reminder,
    notificationIds,
    criticalRepeatNotificationId,
  };
}

export const useReminderStore = create<RemindersState>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: async (input) => {
        const validated = validateReminderInput(input);
        if (!validated.success) {
          logger.error('addReminder validation', validated.error);
          return;
        }
        const now = new Date().toISOString();
        const base: Reminder = {
          ...validated.data,
          id: newId(),
          notificationIds: [],
          createdAt: now,
          updatedAt: now,
          streakCount: validated.data.type === 'habit' ? 0 : undefined,
          weeklyHistory:
            validated.data.type === 'habit' ? [false, false, false, false, false, false, false] : undefined,
        };
        try {
          const scheduled = await reschedule(base);
          set((s) => ({ reminders: [...s.reminders, scheduled] }));
          void syncReminderToCloud(scheduled);
        } catch (e) {
          logger.error('addReminder', e);
          set((s) => ({ reminders: [...s.reminders, base] }));
          void syncReminderToCloud(base);
        }
      },

      updateReminder: async (id, patch) => {
        const prev = get().reminders.find((r) => r.id === id);
        if (!prev) return;
        const next: Reminder = {
          ...prev,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        try {
          const scheduled = await reschedule(next);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? scheduled : r)),
          }));
          void syncReminderToCloud(scheduled);
        } catch (e) {
          logger.error('updateReminder', e);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? next : r)),
          }));
          void syncReminderToCloud(next);
        }
      },

      deleteReminder: async (id) => {
        const prev = get().reminders.find((r) => r.id === id);
        if (prev) {
          try {
            await cancelAllForReminder(prev);
          } catch (e) {
            logger.error('deleteReminder cancel', e);
          }
        }
        set((s) => ({
          reminders: s.reminders.filter((r) => r.id !== id),
        }));
        void deleteReminderFromCloud(id);
      },

      completeReminder: async (id) => {
        const prev = get().reminders.find((r) => r.id === id);
        if (!prev) return;
        try {
          await cancelAllForReminder(prev);
        } catch (e) {
          logger.error('completeReminder cancel', e);
        }
        const completedAt = new Date().toISOString();
        const nextOccurrence = getNextDueDate(
          prev.recurrence,
          new Date(prev.dueAt),
          new Date()
        );
        if (nextOccurrence && prev.recurrence && prev.recurrence.frequency !== 'once') {
          const next: Reminder = {
            ...prev,
            status: 'pending' as ReminderStatus,
            dueAt: nextOccurrence.toISOString(),
            completedAt: undefined,
            updatedAt: completedAt,
            notificationIds: [],
            criticalRepeatNotificationId: undefined,
          };
          try {
            const scheduled = await reschedule(next);
            set((s) => ({
              reminders: s.reminders.map((r) => (r.id === id ? scheduled : r)),
            }));
            void syncReminderToCloud(scheduled);
          } catch (e) {
            logger.error('completeReminder reschedule', e);
            const fallback = {
              ...next,
              notificationIds: [],
            };
            set((s) => ({
              reminders: s.reminders.map((r) => (r.id === id ? fallback : r)),
            }));
            void syncReminderToCloud(fallback as Reminder);
          }
        } else {
          const updated = {
            ...prev,
            status: 'completed' as ReminderStatus,
            completedAt,
            updatedAt: completedAt,
            notificationIds: [],
            criticalRepeatNotificationId: undefined,
            streakCount:
              prev.type === 'habit' ? (prev.streakCount ?? 0) + 1 : prev.streakCount,
            weeklyHistory:
              prev.type === 'habit'
                ? [...(prev.weeklyHistory ?? [false, false, false, false, false, false, false]).slice(1), true]
                : prev.weeklyHistory,
          };
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? updated : r)),
          }));
          void syncReminderToCloud(updated);
        }
      },

      snoozeReminder: async (id, minutes) => {
        const prev = get().reminders.find((r) => r.id === id);
        if (!prev) return;
        const due = new Date(Date.now() + minutes * 60 * 1000);
        const next: Reminder = {
          ...prev,
          status: 'snoozed' as ReminderStatus,
          dueAt: due.toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          const scheduled = await reschedule(next);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? scheduled : r)),
          }));
          void syncReminderToCloud(scheduled);
        } catch (e) {
          logger.error('snoozeReminder', e);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? next : r)),
          }));
          void syncReminderToCloud(next);
        }
      },

      dismissReminder: async (id) => {
        const prev = get().reminders.find((r) => r.id === id);
        if (!prev) return;
        try {
          await cancelAllForReminder(prev);
        } catch (e) {
          logger.error('dismissReminder', e);
        }
        const updated = {
          ...prev,
          status: 'dismissed' as ReminderStatus,
          updatedAt: new Date().toISOString(),
          notificationIds: [],
          criticalRepeatNotificationId: undefined,
        };
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? updated : r)),
        }));
        void syncReminderToCloud(updated);
      },

      setCriticalRepeatId: (id, criticalRepeatNotificationId) => {
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, criticalRepeatNotificationId } : r
          ),
        }));
      },
    }),
    {
      name: 'buzz-reminders',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState: unknown, currentState: RemindersState) => {
        const p = persistedState as { reminders?: Reminder[] } | undefined;
        return {
          ...currentState,
          reminders: (p?.reminders ?? []).map((r) => ({
            ...r,
            notificationIds: r.notificationIds ?? [],
          })),
        };
      },
    }
  )
);

export function selectActiveReminders(state: RemindersState): Reminder[] {
  return state.reminders.filter(
    (r) => r.status === 'pending' || r.status === 'snoozed'
  );
}

export function selectRemindersByType(
  state: RemindersState,
  type: ReminderType
): Reminder[] {
  return selectActiveReminders(state).filter((r) => r.type === type);
}

export function selectHabitReminders(state: RemindersState): Reminder[] {
  return selectActiveReminders(state).filter((r) => r.type === 'habit');
}

export function selectAllActiveSorted(state: RemindersState): Reminder[] {
  const list = selectActiveReminders(state);
  return [...list].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  );
}

export async function startCriticalRepeatIfNeeded(reminder: Reminder): Promise<void> {
  if (reminder.priority !== 'critical') return;
  if (reminder.status !== 'pending' && reminder.status !== 'snoozed') return;
  await cancelNotificationId(reminder.criticalRepeatNotificationId);
  const id = await scheduleCriticalRepeat(reminder);
  useReminderStore.getState().setCriticalRepeatId(reminder.id, id);
}
