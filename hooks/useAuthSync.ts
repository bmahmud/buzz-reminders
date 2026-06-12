import { useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ensureProfileRow,
  pullProfile,
  pullRemindersFromCloud,
  subscribeToReminderChanges,
  unsubscribeFromReminderChanges,
} from '../lib/sync';
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';

export function useAuthSync(): void {
  const setSession = useAuthStore((s) => s.setSession);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      useAuthStore.getState().setHydrated(true);
      return;
    }

    void refreshSession();

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [refreshSession, setSession]);

  useEffect(() => {
    if (!user) {
      unsubscribeFromReminderChanges();
      return;
    }

    void (async () => {
      await ensureProfileRow();
      await pullRemindersFromCloud();
      const profile = await pullProfile();
      if (profile?.displayName) {
        useSettingsStore.getState().setDisplayName(profile.displayName);
      }
      if (profile?.avatarEmoji) {
        useSettingsStore.getState().setAvatarEmoji(profile.avatarEmoji);
      }
      subscribeToReminderChanges();
    })();

    return () => {
      unsubscribeFromReminderChanges();
    };
  }, [user?.id]);
}
