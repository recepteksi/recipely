/**
 * Timer store unit tests.
 *
 * kv-store and the Zustand store itself are reset between tests so each case
 * starts from a clean slate.
 */
/* eslint-disable import/first -- jest.mock() must be hoisted above imports */

// ──────────────────────────────────────────────────────────
// Mocks (declared before imports that use them)
// ──────────────────────────────────────────────────────────

const mockKvStore: Record<string, string> = {};

jest.mock('@infrastructure/storage/kv-store', () => ({
  kvStore: {
    getItem: jest.fn(async (key: string) => mockKvStore[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => { mockKvStore[key] = value; }),
    removeItem: jest.fn(async (key: string) => { delete mockKvStore[key]; }),
  },
}));

jest.mock('@infrastructure/constants/storage', () => ({
  SESSION_STORAGE_KEY: 'recipely.session.v1',
  TIMERS_STORAGE_KEY: 'recipely.timers.v1',
}));

// ──────────────────────────────────────────────────────────
// Imports (after mocks)
// ──────────────────────────────────────────────────────────

import { timerStore, type TimerEntry } from '@application/timers/timer-store';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const makeEntry = (overrides: Partial<TimerEntry> = {}): TimerEntry => ({
  id: 'recipe1:step0:5min',
  recipeId: 'recipe1',
  recipeName: 'Pasta',
  durationSeconds: 300,
  endTimeMs: Date.now() + 300_000,
  isPaused: false,
  remainingMsOnPause: 0,
  startNotifId: 'notif-start-1',
  completionNotifId: 'notif-end-1',
  ...overrides,
});

/** Reset the Zustand store AND the in-memory kv mock between tests. */
const resetAll = (): void => {
  timerStore.setState({ timers: {}, hydrated: false });
  for (const key of Object.keys(mockKvStore)) delete mockKvStore[key];
};

// ──────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────

describe('timerStore', () => {
  beforeEach(resetAll);

  // ── add ──────────────────────────────────────────────────

  describe('add', () => {
    it('stores the entry in memory', async () => {
      const entry = makeEntry();
      await timerStore.getState().add(entry);

      expect(timerStore.getState().timers[entry.id]).toEqual(entry);
    });

    it('persists to kv-store', async () => {
      const entry = makeEntry();
      await timerStore.getState().add(entry);

      const persisted = JSON.parse(mockKvStore['recipely.timers.v1'] ?? '{}') as Record<string, TimerEntry>;
      expect(persisted[entry.id]).toEqual(entry);
    });

    it('allows multiple active timers', async () => {
      const a = makeEntry({ id: 'r1:step0:5min', recipeId: 'r1' });
      const b = makeEntry({ id: 'r2:step1:10min', recipeId: 'r2', durationSeconds: 600 });
      await timerStore.getState().add(a);
      await timerStore.getState().add(b);

      expect(Object.keys(timerStore.getState().timers)).toHaveLength(2);
    });
  });

  // ── remove ───────────────────────────────────────────────

  describe('remove', () => {
    it('deletes the entry from memory and storage', async () => {
      const entry = makeEntry();
      await timerStore.getState().add(entry);
      await timerStore.getState().remove(entry.id);

      expect(timerStore.getState().timers[entry.id]).toBeUndefined();
      const persisted = JSON.parse(mockKvStore['recipely.timers.v1'] ?? '{}') as Record<string, TimerEntry>;
      expect(persisted[entry.id]).toBeUndefined();
    });

    it('is a no-op when the entry does not exist', async () => {
      await expect(timerStore.getState().remove('nonexistent')).resolves.not.toThrow();
    });
  });

  // ── pause ────────────────────────────────────────────────

  describe('pause', () => {
    it('sets isPaused and records remainingMsOnPause', async () => {
      const now = Date.now();
      const entry = makeEntry({ endTimeMs: now + 120_000 }); // 2 min remaining
      await timerStore.getState().add(entry);

      await timerStore.getState().pause(entry.id);

      const updated = timerStore.getState().timers[entry.id];
      expect(updated?.isPaused).toBe(true);
      // remainingMsOnPause should be close to 120_000 (allow ±500 ms for execution time)
      expect(updated?.remainingMsOnPause).toBeGreaterThan(119_000);
      expect(updated?.remainingMsOnPause).toBeLessThanOrEqual(120_000);
    });

    it('persists paused state', async () => {
      const entry = makeEntry({ endTimeMs: Date.now() + 60_000 });
      await timerStore.getState().add(entry);
      await timerStore.getState().pause(entry.id);

      const persisted = JSON.parse(mockKvStore['recipely.timers.v1'] ?? '{}') as Record<string, TimerEntry>;
      expect(persisted[entry.id]?.isPaused).toBe(true);
    });

    it('is a no-op when entry does not exist', async () => {
      await expect(timerStore.getState().pause('ghost')).resolves.not.toThrow();
    });

    it('is a no-op when already paused', async () => {
      const entry = makeEntry({ isPaused: true, remainingMsOnPause: 60_000 });
      await timerStore.getState().add(entry);
      await timerStore.getState().pause(entry.id);

      expect(timerStore.getState().timers[entry.id]?.remainingMsOnPause).toBe(60_000);
    });
  });

  // ── resume ───────────────────────────────────────────────

  describe('resume', () => {
    it('clears isPaused and sets new endTimeMs', async () => {
      const entry = makeEntry({ isPaused: true, remainingMsOnPause: 90_000 });
      await timerStore.getState().add(entry);
      const newEnd = Date.now() + 90_000;

      await timerStore.getState().resume(entry.id, newEnd);

      const updated = timerStore.getState().timers[entry.id];
      expect(updated?.isPaused).toBe(false);
      expect(updated?.endTimeMs).toBe(newEnd);
    });

    it('persists resumed state', async () => {
      const entry = makeEntry({ isPaused: true, remainingMsOnPause: 30_000 });
      await timerStore.getState().add(entry);
      const newEnd = Date.now() + 30_000;

      await timerStore.getState().resume(entry.id, newEnd);

      const persisted = JSON.parse(mockKvStore['recipely.timers.v1'] ?? '{}') as Record<string, TimerEntry>;
      expect(persisted[entry.id]?.isPaused).toBe(false);
      expect(persisted[entry.id]?.endTimeMs).toBe(newEnd);
    });

    it('is a no-op when entry does not exist', async () => {
      await expect(timerStore.getState().resume('ghost', Date.now() + 1000)).resolves.not.toThrow();
    });

    it('is a no-op when entry is not paused', async () => {
      const originalEnd = Date.now() + 60_000;
      const entry = makeEntry({ isPaused: false, endTimeMs: originalEnd });
      await timerStore.getState().add(entry);

      await timerStore.getState().resume(entry.id, Date.now() + 999_000);

      expect(timerStore.getState().timers[entry.id]?.endTimeMs).toBe(originalEnd);
    });
  });

  // ── complete ─────────────────────────────────────────────

  describe('complete', () => {
    it('removes the timer on natural completion', async () => {
      const entry = makeEntry();
      await timerStore.getState().add(entry);
      await timerStore.getState().complete(entry.id);

      expect(timerStore.getState().timers[entry.id]).toBeUndefined();
    });

    it('persists removal after completion', async () => {
      const entry = makeEntry();
      await timerStore.getState().add(entry);
      await timerStore.getState().complete(entry.id);

      const persisted = JSON.parse(mockKvStore['recipely.timers.v1'] ?? '{}') as Record<string, TimerEntry>;
      expect(persisted[entry.id]).toBeUndefined();
    });
  });

  // ── hydrate ──────────────────────────────────────────────

  describe('hydrate', () => {
    it('sets hydrated = true even when storage is empty', async () => {
      await timerStore.getState().hydrate();
      expect(timerStore.getState().hydrated).toBe(true);
    });

    it('restores active (non-expired) timers', async () => {
      const future = Date.now() + 300_000;
      const entry = makeEntry({ endTimeMs: future });
      mockKvStore['recipely.timers.v1'] = JSON.stringify({ [entry.id]: entry });

      await timerStore.getState().hydrate();

      expect(timerStore.getState().timers[entry.id]).toBeDefined();
    });

    it('drops expired running timers', async () => {
      const past = Date.now() - 1000; // already ended
      const entry = makeEntry({ endTimeMs: past, isPaused: false });
      mockKvStore['recipely.timers.v1'] = JSON.stringify({ [entry.id]: entry });

      await timerStore.getState().hydrate();

      expect(timerStore.getState().timers[entry.id]).toBeUndefined();
    });

    it('keeps paused timers regardless of endTimeMs', async () => {
      const past = Date.now() - 5000;
      const entry = makeEntry({ endTimeMs: past, isPaused: true, remainingMsOnPause: 60_000 });
      mockKvStore['recipely.timers.v1'] = JSON.stringify({ [entry.id]: entry });

      await timerStore.getState().hydrate();

      expect(timerStore.getState().timers[entry.id]).toBeDefined();
      expect(timerStore.getState().timers[entry.id]?.isPaused).toBe(true);
    });

    it('handles corrupt storage without throwing', async () => {
      mockKvStore['recipely.timers.v1'] = 'NOT_VALID_JSON{{';
      await expect(timerStore.getState().hydrate()).resolves.not.toThrow();
      expect(timerStore.getState().hydrated).toBe(true);
    });

    it('persists the cleaned-up timer list back to storage', async () => {
      const active = makeEntry({ id: 'active', endTimeMs: Date.now() + 100_000 });
      const expired = makeEntry({ id: 'expired', endTimeMs: Date.now() - 1000, isPaused: false });
      mockKvStore['recipely.timers.v1'] = JSON.stringify({ [active.id]: active, [expired.id]: expired });

      await timerStore.getState().hydrate();

      const stored = JSON.parse(mockKvStore['recipely.timers.v1'] ?? '{}') as Record<string, TimerEntry>;
      expect(stored['active']).toBeDefined();
      expect(stored['expired']).toBeUndefined();
    });

    it('handles multiple concurrent timers', async () => {
      const entries: Record<string, TimerEntry> = {};
      for (let i = 0; i < 5; i++) {
        const e = makeEntry({ id: `r${String(i)}:step0:5min`, recipeId: `r${String(i)}`, endTimeMs: Date.now() + 300_000 });
        entries[e.id] = e;
      }
      mockKvStore['recipely.timers.v1'] = JSON.stringify(entries);

      await timerStore.getState().hydrate();

      expect(Object.keys(timerStore.getState().timers)).toHaveLength(5);
    });
  });
});
