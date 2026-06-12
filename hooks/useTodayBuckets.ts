import { useMemo } from 'react';
import type { Reminder } from '../constants/reminderTypes';
import { useReminderStore } from '../store/reminders';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const NOW_WINDOW_MS = 60 * 60 * 1000;

export interface TodayBuckets {
  rightNow: Reminder[];
  laterToday: Reminder[];
  doneToday: Reminder[];
  nowCount: number;
  laterCount: number;
}

export function useTodayBuckets(): TodayBuckets {
  const reminders = useReminderStore((s) => s.reminders);

  return useMemo(() => {
    const now = new Date();
    const nowMs = now.getTime();

    const todayActive = reminders.filter((r) => {
      if (r.status !== 'pending' && r.status !== 'snoozed') return false;
      return isSameDay(new Date(r.dueAt), now);
    });

    const rightNow = todayActive.filter((r) => {
      const dueMs = new Date(r.dueAt).getTime();
      return dueMs <= nowMs + NOW_WINDOW_MS;
    });

    const laterToday = todayActive.filter((r) => {
      const dueMs = new Date(r.dueAt).getTime();
      return dueMs > nowMs + NOW_WINDOW_MS;
    });

    const doneToday = reminders
      .filter((r) => {
        if (r.status !== 'completed') return false;
        const completedAt = r.completedAt ? new Date(r.completedAt) : new Date(r.dueAt);
        return isSameDay(completedAt, now);
      })
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? b.dueAt).getTime() -
          new Date(a.completedAt ?? a.dueAt).getTime()
      );

    const sortByDue = (a: Reminder, b: Reminder) =>
      new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();

    return {
      rightNow: rightNow.sort(sortByDue),
      laterToday: laterToday.sort(sortByDue),
      doneToday,
      nowCount: rightNow.length,
      laterCount: laterToday.length,
    };
  }, [reminders]);
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
