import { create } from 'zustand';
import { kvStore } from '@infrastructure/storage/kv-store';
import { TIMERS_STORAGE_KEY } from '@infrastructure/constants/storage';

export interface TimerEntry {
  /** Stable unique key: `${recipeId}:step${stepIndex}:${durationMin}min` */
  id: string;
  recipeId: string;
  recipeName: string;
  durationSeconds: number;
  /** Absolute ms timestamp when the timer is scheduled to complete. */
  endTimeMs: number;
  isPaused: boolean;
  /** Only valid while paused: remaining ms at the moment pause was pressed. */
  remainingMsOnPause: number;
  /** ID of the "timer running" notification shown in the shade (null on web). */
  startNotifId: string | null;
  /** ID of the scheduled completion notification (null on web). */
  completionNotifId: string | null;
}

export interface TimerStoreState {
  timers: Record<string, TimerEntry>;
  /** True once hydrate() has resolved — avoids flash of empty state. */
  hydrated: boolean;
  /** Restore timers from secure storage on app launch. Drops expired entries. */
  hydrate: () => Promise<void>;
  add: (entry: TimerEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  pause: (id: string) => Promise<void>;
  /** `newEndTimeMs` = Date.now() + remainingMsOnPause when resuming. */
  resume: (id: string, newEndTimeMs: number) => Promise<void>;
  /** Removes the timer after it naturally completes. */
  complete: (id: string) => Promise<void>;
}

const persist = async (timers: Record<string, TimerEntry>): Promise<void> => {
  await kvStore.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
};

export const timerStore = create<TimerStoreState>((set, get) => ({
  timers: {},
  hydrated: false,

  hydrate: async () => {
    const raw = await kvStore.getItem(TIMERS_STORAGE_KEY);
    if (!raw) {
      set({ hydrated: true });
      return;
    }
    try {
      const stored = JSON.parse(raw) as Record<string, TimerEntry>;
      const now = Date.now();
      const active: Record<string, TimerEntry> = {};
      for (const [id, entry] of Object.entries(stored)) {
        // Keep running timers that haven't expired, and all paused timers.
        const expired = !entry.isPaused && entry.endTimeMs <= now;
        if (!expired) active[id] = entry;
      }
      set({ timers: active, hydrated: true });
      await persist(active);
    } catch {
      set({ hydrated: true });
    }
  },

  add: async (entry) => {
    const timers = { ...get().timers, [entry.id]: entry };
    set({ timers });
    await persist(timers);
  },

  remove: async (id) => {
    const timers = { ...get().timers };
    delete timers[id];
    set({ timers });
    await persist(timers);
  },

  pause: async (id) => {
    const entry = get().timers[id];
    if (!entry || entry.isPaused) return;
    const remainingMsOnPause = Math.max(0, entry.endTimeMs - Date.now());
    const updated: TimerEntry = { ...entry, isPaused: true, remainingMsOnPause };
    const timers = { ...get().timers, [id]: updated };
    set({ timers });
    await persist(timers);
  },

  resume: async (id, newEndTimeMs) => {
    const entry = get().timers[id];
    if (!entry || !entry.isPaused) return;
    const updated: TimerEntry = { ...entry, isPaused: false, endTimeMs: newEndTimeMs };
    const timers = { ...get().timers, [id]: updated };
    set({ timers });
    await persist(timers);
  },

  complete: async (id) => {
    const timers = { ...get().timers };
    delete timers[id];
    set({ timers });
    await persist(timers);
  },
}));
