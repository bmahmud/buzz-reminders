import { selectHabitReminders, useReminderStore } from '../store/reminders';

export function useHabitReminders() {
  return useReminderStore(selectHabitReminders);
}
