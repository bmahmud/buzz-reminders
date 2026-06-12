export type ReminderType =
  | 'task'
  | 'event'
  | 'habit'
  | 'medication'
  | 'bill'
  | 'custom';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ReminderStatus =
  | 'pending'
  | 'snoozed'
  | 'completed'
  | 'dismissed'
  | 'deleted';

export type AlertMode = 'sound' | 'vibrate' | 'both' | 'silent';

export interface RecurrenceRule {
  frequency:
    | 'once'
    | 'daily'
    | 'weekdays'
    | 'weekends'
    | 'weekly'
    | 'biweekly'
    | 'monthly'
    | 'yearly'
    | 'custom';
  interval?: number;
  daysOfWeek?: number[];
  endCondition: 'never' | 'after' | 'onDate';
  endAfterOccurrences?: number;
  endDate?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: ReminderType;
  priority: Priority;
  dueAt: string;
  recurrence?: RecurrenceRule;
  alertMode: AlertMode;
  soundId?: string;
  snoozeOptions: number[];
  tags: string[];
  status: ReminderStatus;
  completedAt?: string;
  notificationIds: string[];
  criticalRepeatNotificationId?: string;
  createdAt: string;
  updatedAt: string;
  /** Habit streak count (habits only) */
  streakCount?: number;
  /** Last 7 days completion (habits only), index 0 = 6 days ago */
  weeklyHistory?: boolean[];
}

export const REMINDER_TYPE_META: Record<
  ReminderType,
  { label: string; icon: string }
> = {
  task: { label: 'Task', icon: 'checkbox-outline' },
  event: { label: 'Event', icon: 'calendar-outline' },
  habit: { label: 'Habit', icon: 'repeat-outline' },
  medication: { label: 'Medication', icon: 'medical-outline' },
  bill: { label: 'Bill', icon: 'card-outline' },
  custom: { label: 'Custom', icon: 'pricetag-outline' },
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const ALERT_MODE_LABELS: Record<AlertMode, string> = {
  sound: 'Sound',
  vibrate: 'Vibrate',
  both: 'Both',
  silent: 'Silent',
};

export const SNOOZE_MINUTES_OPTIONS = [5, 10, 15, 30, 60] as const;
