import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { logger } from '../lib/logger';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isHydrated: !isSupabaseConfigured,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, isHydrated: true }),
  setLoading: (isLoading) => set({ isLoading }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  signOut: async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null });
  },
  refreshSession: async () => {
    const supabase = getSupabase();
    if (!supabase) {
      set({ isHydrated: true });
      return;
    }
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) logger.error('refreshSession', error);
      set({
        session: data.session,
        user: data.session?.user ?? null,
        isHydrated: true,
      });
    } catch (e) {
      logger.error('refreshSession', e);
      set({ isHydrated: true });
    }
  },
}));

export function selectIsAuthenticated(state: AuthState): boolean {
  return state.user !== null;
}

export function selectAuthHydrated(state: AuthState): boolean {
  return state.isHydrated;
}
