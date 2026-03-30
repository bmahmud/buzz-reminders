import type { RecurrenceRule } from '../constants/reminderTypes';

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Returns the next due instant at the same clock time as `from`, or null if recurrence ended. */
export function getNextDueDate(
  rule: RecurrenceRule | undefined,
  lastDue: Date,
  from: Date = new Date()
): Date | null {
  if (!rule || rule.frequency === 'once') {
    return null;
  }

  const timeMs =
    lastDue.getHours() * 3600000 +
    lastDue.getMinutes() * 60000 +
    lastDue.getSeconds() * 1000;

  const applyTime = (d: Date): Date => {
    const x = new Date(d);
    const sod = startOfDay(x);
    return new Date(sod.getTime() + timeMs);
  };

  let candidate = new Date(lastDue);

  const guardMax = 400;
  let iterations = 0;

  while (iterations < guardMax) {
    iterations += 1;

    switch (rule.frequency) {
      case 'daily':
        candidate = addDays(candidate, 1);
        break;
      case 'weekdays': {
        candidate = addDays(candidate, 1);
        while (!isWeekday(candidate) && iterations < guardMax) {
          candidate = addDays(candidate, 1);
          iterations += 1;
        }
        break;
      }
      case 'weekends': {
        candidate = addDays(candidate, 1);
        while (!isWeekend(candidate) && iterations < guardMax) {
          candidate = addDays(candidate, 1);
          iterations += 1;
        }
        break;
      }
      case 'weekly': {
        candidate = addDays(candidate, 7);
        break;
      }
      case 'biweekly': {
        candidate = addDays(candidate, 14);
        break;
      }
      case 'monthly': {
        const x = new Date(candidate);
        x.setMonth(x.getMonth() + 1);
        candidate = x;
        break;
      }
      case 'yearly': {
        const x = new Date(candidate);
        x.setFullYear(x.getFullYear() + 1);
        candidate = x;
        break;
      }
      case 'custom': {
        const n = rule.interval ?? 1;
        candidate = addDays(candidate, n);
        break;
      }
      default:
        return null;
    }

    const due = applyTime(candidate);
    if (due.getTime() > from.getTime()) {
      if (rule.endCondition === 'onDate' && rule.endDate) {
        const end = new Date(rule.endDate);
        if (due.getTime() > end.getTime()) return null;
      }
      return due;
    }
  }

  return null;
}
