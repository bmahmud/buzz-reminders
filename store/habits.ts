import { create } from 'zustand';

/** MVP: lightweight habit view state; streaks are Phase 2 per SPEC. */
interface HabitsState {
  selectedHabitId: string | null;
  setSelectedHabitId: (id: string | null) => void;
}

export const useHabitsStore = create<HabitsState>((set) => ({
  selectedHabitId: null,
  setSelectedHabitId: (id) => set({ selectedHabitId: id }),
}));
