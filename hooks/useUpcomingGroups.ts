import { useMemo } from 'react';
import type { Reminder } from '../constants/reminderTypes';
import { useReminderStore, selectActiveReminders } from '../store/reminders';

export interface UpcomingGroup {
  key: string;
  title: string;
  tone: 'ink' | 'muted' | 'coral';
  items: Reminder[];
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isTomorrow(date: Date, now: Date): boolean {
  const t = startOfDay(now);
  t.setDate(t.getDate() + 1);
  return startOfDay(date).getTime() === t.getTime();
}

function isThisWeekend(date: Date, now: Date): boolean {
  const day = date.getDay();
  const diff = startOfDay(date).getTime() - startOfDay(now).getTime();
  const days = diff / (24 * 60 * 60 * 1000);
  return days >= 2 && days <= 7 && (day === 0 || day === 6);
}

export function useUpcomingGroups(): UpcomingGroup[] {
  const reminders = useReminderStore(selectActiveReminders);

  return useMemo(() => {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);

    const upcoming = reminders
      .filter((r) => {
        const d = new Date(r.dueAt);
        return d > now && d <= end && !isSameDay(d, now);
      })
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    const tomorrow: Reminder[] = [];
    const weekend: Reminder[] = [];
    const later: Reminder[] = [];

    for (const r of upcoming) {
      const d = new Date(r.dueAt);
      if (isTomorrow(d, now)) tomorrow.push(r);
      else if (isThisWeekend(d, now)) weekend.push(r);
      else later.push(r);
    }

    const groups: UpcomingGroup[] = [];
    if (tomorrow.length) {
      groups.push({ key: 'tomorrow', title: 'Tomorrow', tone: 'ink', items: tomorrow });
    }
    if (weekend.length) {
      groups.push({ key: 'weekend', title: 'This weekend', tone: 'muted', items: weekend });
    }
    if (later.length) {
      groups.push({ key: 'later', title: 'Later', tone: 'muted', items: later });
    }
    return groups;
  }, [reminders]);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
