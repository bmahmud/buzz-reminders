import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Reminder } from '../constants/reminderTypes';
import { logger } from './logger';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { useReminderStore } from '../store/reminders';
import { useAuthStore } from '../store/auth';

interface DbReminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  due_at: string;
  recurrence: Reminder['recurrence'] | null;
  alert_mode: string;
  status: string;
  tags: string[] | null;
  completed_at: string | null;
  streak_count: number | null;
  weekly_history: boolean[] | null;
  created_at: string;
  updated_at: string;
}

function toDb(reminder: Reminder, userId: string): Omit<DbReminder, 'created_at'> & { created_at?: string } {
  return {
    id: reminder.id,
    user_id: userId,
    title: reminder.title,
    description: reminder.description ?? null,
    type: reminder.type,
    priority: reminder.priority,
    due_at: reminder.dueAt,
    recurrence: reminder.recurrence ?? null,
    alert_mode: reminder.alertMode,
    status: reminder.status,
    tags: reminder.tags,
    completed_at: reminder.completedAt ?? null,
    streak_count: reminder.streakCount ?? null,
    weekly_history: reminder.weeklyHistory ?? null,
    updated_at: reminder.updatedAt,
    created_at: reminder.createdAt,
  };
}

function fromDb(row: DbReminder): Reminder {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type as Reminder['type'],
    priority: row.priority as Reminder['priority'],
    dueAt: row.due_at,
    recurrence: row.recurrence ?? undefined,
    alertMode: row.alert_mode as Reminder['alertMode'],
    status: row.status as Reminder['status'],
    tags: row.tags ?? [],
    completedAt: row.completed_at ?? undefined,
    streakCount: row.streak_count ?? undefined,
    weeklyHistory: row.weekly_history ?? undefined,
    snoozeOptions: [],
    notificationIds: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

let realtimeChannel: RealtimeChannel | null = null;

export async function pullRemindersFromCloud(): Promise<void> {
  const supabase = getSupabase();
  const userId = useAuthStore.getState().user?.id;
  if (!supabase || !userId) return;

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    logger.error('pullRemindersFromCloud', error);
    return;
  }

  const remote = (data as DbReminder[]).map(fromDb);
  const local = useReminderStore.getState().reminders;
  const merged = mergeReminders(local, remote);
  useReminderStore.setState({ reminders: merged });
}

function mergeReminders(local: Reminder[], remote: Reminder[]): Reminder[] {
  const map = new Map<string, Reminder>();
  for (const r of local) map.set(r.id, r);
  for (const r of remote) {
    const existing = map.get(r.id);
    if (!existing || new Date(r.updatedAt) >= new Date(existing.updatedAt)) {
      map.set(r.id, { ...r, notificationIds: existing?.notificationIds ?? [] });
    }
  }
  return Array.from(map.values());
}

export async function syncReminderToCloud(reminder: Reminder): Promise<void> {
  const supabase = getSupabase();
  const userId = useAuthStore.getState().user?.id;
  if (!supabase || !userId || !isSupabaseConfigured) return;

  const { error } = await supabase.from('reminders').upsert(toDb(reminder, userId), {
    onConflict: 'id',
  });
  if (error) logger.error('syncReminderToCloud', error);
}

export async function deleteReminderFromCloud(id: string): Promise<void> {
  const supabase = getSupabase();
  const userId = useAuthStore.getState().user?.id;
  if (!supabase || !userId) return;

  const { error } = await supabase.from('reminders').delete().eq('id', id).eq('user_id', userId);
  if (error) logger.error('deleteReminderFromCloud', error);
}

export async function syncProfile(displayName: string, avatarEmoji: string): Promise<void> {
  const supabase = getSupabase();
  const userId = useAuthStore.getState().user?.id;
  if (!supabase || !userId) return;

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    display_name: displayName,
    avatar_emoji: avatarEmoji,
  });
  if (error) logger.error('syncProfile', error);
}

export async function pullProfile(): Promise<{ displayName?: string; avatarEmoji?: string } | null> {
  const supabase = getSupabase();
  const userId = useAuthStore.getState().user?.id;
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_emoji')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    displayName: data.display_name ?? undefined,
    avatarEmoji: data.avatar_emoji ?? undefined,
  };
}

export function subscribeToReminderChanges(): void {
  const supabase = getSupabase();
  const userId = useAuthStore.getState().user?.id;
  if (!supabase || !userId) return;

  if (realtimeChannel) {
    void supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel(`reminders:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${userId}` },
      () => {
        void pullRemindersFromCloud();
      }
    )
    .subscribe();
}

export function unsubscribeFromReminderChanges(): void {
  const supabase = getSupabase();
  if (supabase && realtimeChannel) {
    void supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

export async function ensureProfileRow(): Promise<void> {
  const supabase = getSupabase();
  const user = useAuthStore.getState().user;
  if (!supabase || !user) return;

  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: user.email?.split('@')[0] ?? 'Friend',
    avatar_emoji: '🦊',
  });

  await supabase.from('user_settings').upsert({ user_id: user.id });
}
