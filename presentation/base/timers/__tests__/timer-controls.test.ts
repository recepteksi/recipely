/**
 * timer-controls orchestration tests.
 */
/* eslint-disable import/first -- jest.mock() must be hoisted above imports */

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
  scheduleTimerCompleteNotification: jest.fn(async () => ['notif-1', 'notif-2', 'notif-3']),
  cancelNotifications: jest.fn(async () => undefined),
}));

import { timerStore } from '@application/timers/timer-store';
import {
  startTimer,
  stopTimer,
  pauseTimer,
  resumeTimer,
} from '@presentation/base/timers/timer-controls';
import {
  scheduleTimerCompleteNotification,
  cancelNotifications,
} from '@infrastructure/notifications/notification-service';

const resetAll = (): void => {
  timerStore.setState({ timers: {}, hydrated: false });
  for (const key of Object.keys(mockKvStore)) delete mockKvStore[key];
  jest.clearAllMocks();
};

describe('timer-controls', () => {
  beforeEach(resetAll);

  describe('startTimer', () => {
    it('adds entry with all notification ids and a future endTimeMs', async () => {
      const before = Date.now();
      await startTimer('r1:prep', 'r1', 'Pasta', 5);

      const entry = timerStore.getState().timers['r1:prep'];
      expect(entry).toBeDefined();
      expect(entry?.recipeId).toBe('r1');
      expect(entry?.durationSeconds).toBe(300);
      expect(entry?.isPaused).toBe(false);
      expect(entry?.completionNotifIds).toEqual(['notif-1', 'notif-2', 'notif-3']);
      expect(entry?.endTimeMs).toBeGreaterThanOrEqual(before + 300_000);
    });

    it('schedules alarm notifications', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      expect(scheduleTimerCompleteNotification).toHaveBeenCalledTimes(1);
    });

    it('is a no-op for a non-positive duration', async () => {
      await startTimer('r1:cook', 'r1', 'Pasta', 0);
      expect(timerStore.getState().timers['r1:cook']).toBeUndefined();
      expect(scheduleTimerCompleteNotification).not.toHaveBeenCalled();
    });
  });

  describe('stopTimer', () => {
    it('removes the timer and cancels all notifications', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      await stopTimer('r1:prep');

      expect(timerStore.getState().timers['r1:prep']).toBeUndefined();
      expect(cancelNotifications).toHaveBeenCalledWith(['notif-1', 'notif-2', 'notif-3']);
    });

    it('is a no-op when the timer does not exist', async () => {
      await expect(stopTimer('ghost')).resolves.not.toThrow();
    });
  });

  describe('pauseTimer', () => {
    it('pauses a running timer and records remaining time', async () => {
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
    it('resumes a paused timer with a fresh endTimeMs and new notification ids', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      await pauseTimer('r1:prep');
      const before = Date.now();
      await resumeTimer('r1:prep');

      const entry = timerStore.getState().timers['r1:prep'];
      expect(entry?.isPaused).toBe(false);
      expect(entry?.endTimeMs).toBeGreaterThanOrEqual(before);
      expect(entry?.completionNotifIds).toEqual(['notif-1', 'notif-2', 'notif-3']);
    });

    it('is a no-op when the timer is not paused', async () => {
      await startTimer('r1:prep', 'r1', 'Pasta', 5);
      const originalEnd = timerStore.getState().timers['r1:prep']?.endTimeMs;
      await resumeTimer('r1:prep');
      expect(timerStore.getState().timers['r1:prep']?.endTimeMs).toBe(originalEnd);
    });
  });
});
