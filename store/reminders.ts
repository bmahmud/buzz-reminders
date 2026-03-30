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

function newId(): string {
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
        const now = new Date().toISOString();
        const base: Reminder = {
          ...input,
          id: newId(),
          notificationIds: [],
          createdAt: now,
          updatedAt: now,
        };
        try {
          const scheduled = await reschedule(base);
          set((s) => ({ reminders: [...s.reminders, scheduled] }));
        } catch (e) {
          logger.error('addReminder', e);
          set((s) => ({ reminders: [...s.reminders, base] }));
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
        } catch (e) {
          logger.error('updateReminder', e);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? next : r)),
          }));
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
          } catch (e) {
            logger.error('completeReminder reschedule', e);
            set((s) => ({
              reminders: s.reminders.map((r) =>
                r.id === id
                  ? {
                      ...next,
                      notificationIds: [],
                    }
                  : r
              ),
            }));
          }
        } else {
          set((s) => ({
            reminders: s.reminders.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: 'completed' as ReminderStatus,
                    completedAt,
                    updatedAt: completedAt,
                    notificationIds: [],
                    criticalRepeatNotificationId: undefined,
                  }
                : r
            ),
          }));
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
        } catch (e) {
          logger.error('snoozeReminder', e);
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? next : r)),
          }));
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
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'dismissed' as ReminderStatus,
                  updatedAt: new Date().toISOString(),
                  notificationIds: [],
                  criticalRepeatNotificationId: undefined,
                }
              : r
          ),
        }));
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
