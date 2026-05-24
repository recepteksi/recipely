import { create } from 'zustand';

export interface AlarmEntry {
  timerId: string;
  recipeName: string;
}

export interface AlarmStoreState {
  /** Non-null while an alarm overlay is visible. */
  activeAlarm: AlarmEntry | null;
  /** Triggers the alarm overlay. No-op if the same timer's alarm is already active. */
  trigger: (timerId: string, recipeName: string) => void;
  dismiss: () => void;
}

export const alarmStore = create<AlarmStoreState>((set) => ({
  activeAlarm: null,
  trigger: (timerId, recipeName) =>
    set((state) => {
      if (state.activeAlarm?.timerId === timerId) return state;
      return { activeAlarm: { timerId, recipeName } };
    }),
  dismiss: () => set({ activeAlarm: null }),
}));
