import { z } from 'zod';

const reminderTypeSchema = z.enum([
  'task',
  'event',
  'habit',
  'medication',
  'bill',
  'custom',
]);

const prioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

const alertModeSchema = z.enum(['sound', 'vibrate', 'both', 'silent']);

const recurrenceSchema = z
  .object({
    frequency: z.enum([
      'once',
      'daily',
      'weekdays',
      'weekends',
      'weekly',
      'biweekly',
      'monthly',
      'yearly',
      'custom',
    ]),
    interval: z.number().optional(),
    daysOfWeek: z.array(z.number()).optional(),
    endCondition: z.enum(['never', 'after', 'onDate']),
    endAfterOccurrences: z.number().optional(),
    endDate: z.string().optional(),
  })
  .optional();

export const reminderInputSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  type: reminderTypeSchema,
  priority: prioritySchema,
  dueAt: z.string().min(1),
  recurrence: recurrenceSchema,
  alertMode: alertModeSchema,
  snoozeOptions: z.array(z.number()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(['pending', 'snoozed', 'completed', 'dismissed', 'deleted']),
  earlyReminderMinutes: z.number().nullable().optional(),
});

export type ReminderInputValidated = z.infer<typeof reminderInputSchema>;

export function validateReminderInput(
  input: unknown
): { success: true; data: ReminderInputValidated } | { success: false; error: string } {
  const result = reminderInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Invalid reminder' };
  }
  return { success: true, data: result.data };
}

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  avatarEmoji: z.string().max(4).optional(),
});

export const emailSchema = z.string().trim().email().max(254);
