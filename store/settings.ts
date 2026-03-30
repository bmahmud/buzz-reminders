import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (value: boolean) =>
        set({ hasCompletedOnboarding: value }),
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
