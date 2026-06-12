import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SettingsState {
  hasCompletedOnboarding: boolean;
  displayName: string;
  avatarEmoji: string;
  notificationsEnabled: boolean;
  defaultAlert: 'sound' | 'vibrate' | 'both' | 'silent';
  snoozeMinutes: number;
  theme: 'warm';
  skippedCloudAuth: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  setDisplayName: (value: string) => void;
  setAvatarEmoji: (value: string) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setDefaultAlert: (value: SettingsState['defaultAlert']) => void;
  setSnoozeMinutes: (value: number) => void;
  setSkippedCloudAuth: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      displayName: 'Sam',
      avatarEmoji: '🦊',
      notificationsEnabled: true,
      defaultAlert: 'both',
      snoozeMinutes: 10,
      theme: 'warm',
      skippedCloudAuth: false,
      setHasCompletedOnboarding: (value: boolean) =>
        set({ hasCompletedOnboarding: value }),
      setDisplayName: (value: string) => set({ displayName: value }),
      setAvatarEmoji: (value: string) => set({ avatarEmoji: value }),
      setNotificationsEnabled: (value: boolean) => set({ notificationsEnabled: value }),
      setDefaultAlert: (value) => set({ defaultAlert: value }),
      setSnoozeMinutes: (value: number) => set({ snoozeMinutes: value }),
      setSkippedCloudAuth: (value: boolean) => set({ skippedCloudAuth: value }),
    }),
    {
      name: 'buzz-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function selectHasCompletedOnboarding(state: SettingsState): boolean {
  return state.hasCompletedOnboarding;
}
