/** Early reminder offset in minutes before dueAt. null = none. */
export const EARLY_REMINDER_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: 'None', minutes: null },
  { label: '5 minutes before', minutes: 5 },
  { label: '15 minutes before', minutes: 15 },
  { label: '30 minutes before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '2 hours before', minutes: 120 },
  { label: '1 day before', minutes: 1440 },
  { label: '2 days before', minutes: 2880 },
  { label: '1 week before', minutes: 10080 },
  { label: '1 month before', minutes: 43200 },
];

export function formatEarlyReminder(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return 'None';
  const match = EARLY_REMINDER_OPTIONS.find((o) => o.minutes === minutes);
  return match?.label ?? `${minutes} min before`;
}
