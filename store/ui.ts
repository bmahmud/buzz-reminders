import { create } from 'zustand';

interface UiState {
  criticalOverlayReminderId: string | null;
  setCriticalOverlayReminderId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  criticalOverlayReminderId: null,
  setCriticalOverlayReminderId: (id) => set({ criticalOverlayReminderId: id }),
}));
