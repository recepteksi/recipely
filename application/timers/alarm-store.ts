import { create } from 'zustand';
import type { AlarmStoreState } from '@application/timers/alarm-store-state';

export const alarmStore = create<AlarmStoreState>((set) => ({
  activeAlarm: null,
  trigger: (timerId, recipeName) =>
    set((state) => {
      if (state.activeAlarm?.timerId === timerId) return state;
      return { activeAlarm: { timerId, recipeName } };
    }),
  dismiss: () => set({ activeAlarm: null }),
}));
