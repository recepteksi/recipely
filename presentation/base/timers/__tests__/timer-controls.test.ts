/**
 * timer-controls orchestration tests — verify the timer store ends up in the
 * right state and the notification service is invoked. The notification
 * service and kv-store are mocked so no native modules are touched.
 */
/* eslint-disable import/first -- jest.mock() must be hoisted above imports */

// ──────────────────────────────────────────────────────────
// Mocks (declared before the imports that use them)
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

jest.mock('@infrastructure/notifications/notification-service', () => ({
  requestNotificationPermissions: jest.fn(async () => true),
  showTimerNotification: jest.fn(async () => 'start-notif'),
  updateTimerNotification: jest.fn(async () => undefined),
  scheduleTimerCompleteNotification: jest.fn(async () => 'complete-notif'),
  cancelNotification: jest.fn(async () => undefined),
}));

// ──────────────────────────────────────────────────────────
// Imports (after mocks)
// ──────────────────────────────────────────────────────────

import { timerStore } from '@application/timers/timer-store';
import {
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
} from '@presentation/base/timers/timer-controls';
import {
  showTimerNotification,
  scheduleTimerCompleteNotification,
  cancelNotification,
} from '@infrastructure/notifications/notification-service';

const resetAll = (): void => {
  timerStore.setState({ timers: {}, hydrated: false });
  for (const key of Object.keys(mockKvStore)) delete mockKvStore[key];
  jest.clearAllMocks();
};

describe('timer-controls', () => {
  beforeEach(resetAll);

  // ── startTimer ───────────────────────────────────────────

  describe('startTimer', () => {
    it('adds a timer entry with notification ids and a future endTimeMs', async () => {
      const before = Date.now();
      await startTimer('r1:prep', 'r1', 'Pasta', 5);

      const entry = timerStore.getState().timers['r1:prep'];
      expect(entry).toBeDefined();
      expect(entry?.recipeId).toBe('r1');
      expect(entry?.recipeName).toBe('Pasta');
      expect(entry?.durationSeconds).toBe(300);
      expect(entry?.isPaused).toBe(false);
      expect(entry?.startNotifId).toBe('start-notif');
      expect(entry?.completionNotifId).toBe('complete-notif');
      expect(entry?.endTimeMs).toBeGreaterThanOrEqual(before + 300_000);
    });

    it('schedules both the running and completion notifications', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);

      expect(showTimerNotification).toHaveBeenCalledTimes(1);
      expect(scheduleTimerCompleteNotification).toHaveBeenCalledTimes(1);
    });

    it('is a no-op for a non-positive duration', async () => {
      await startTimer('r1:cook', 'r1', 'Pasta', 0);

      expect(timerStore.getState().timers['r1:cook']).toBeUndefined();
      expect(showTimerNotification).not.toHaveBeenCalled();
    });
  });

  // ── stopTimer ────────────────────────────────────────────

  describe('stopTimer', () => {
    it('removes the timer and cancels its notifications', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      await stopTimer('r1:prep');

      expect(timerStore.getState().timers['r1:prep']).toBeUndefined();
      // start + completion notification both cancelled
      expect(cancelNotification).toHaveBeenCalledWith('start-notif');
      expect(cancelNotification).toHaveBeenCalledWith('complete-notif');
    });

    it('is a no-op when the timer does not exist', async () => {
      await expect(stopTimer('ghost')).resolves.not.toThrow();
    });
  });

  // ── pauseTimer / resumeTimer ─────────────────────────────

  describe('pauseTimer', () => {
    it('pauses a running timer and records the remaining time', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      await pauseTimer('r1:prep');

      const entry = timerStore.getState().timers['r1:prep'];
      expect(entry?.isPaused).toBe(true);
      expect(entry?.remainingMsOnPause).toBeGreaterThan(290_000);
    });

    it('is a no-op when already paused', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      await pauseTimer('r1:prep');
      const firstRemaining = timerStore.getState().timers['r1:prep']?.remainingMsOnPause;
      await pauseTimer('r1:prep');

      expect(timerStore.getState().timers['r1:prep']?.remainingMsOnPause).toBe(firstRemaining);
    });
  });

  describe('resumeTimer', () => {
    it('resumes a paused timer with a fresh endTimeMs', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      await pauseTimer('r1:prep');
      const before = Date.now();
      await resumeTimer('r1:prep');

      const entry = timerStore.getState().timers['r1:prep'];
      expect(entry?.isPaused).toBe(false);
      expect(entry?.endTimeMs).toBeGreaterThanOrEqual(before);
    });

    it('is a no-op when the timer is not paused', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      const originalEnd = timerStore.getState().timers['r1:prep']?.endTimeMs;
      await resumeTimer('r1:prep');

      expect(timerStore.getState().timers['r1:prep']?.endTimeMs).toBe(originalEnd);
    });
  });
});
