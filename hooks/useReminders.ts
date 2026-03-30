import { useMemo } from 'react';
import type { Reminder } from '../constants/reminderTypes';
import {
  selectActiveReminders,
  useReminderStore,
} from '../store/reminders';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function useTodayReminders(): Reminder[] {
  const reminders = useReminderStore(selectActiveReminders);
  return useMemo(() => {
    const now = new Date();
    return reminders
      .filter((r) => isSameDay(new Date(r.dueAt), now))
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [reminders]);
}

export function useUpcomingReminders(): Reminder[] {
  const reminders = useReminderStore(selectActiveReminders);
  return useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return reminders
      .filter((r) => {
        const d = new Date(r.dueAt);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [reminders]);
}
