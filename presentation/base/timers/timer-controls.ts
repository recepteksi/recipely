import { timerStore } from '@application/timers/timer-store';
import {
  requestNotificationPermissions,
  scheduleTimerCompleteNotification,
  cancelNotifications,
} from '@infrastructure/notifications/notification-service';

/** Starts a timer: schedules all alarm notifications and persists the entry. */
export const startTimer = async (
  timerId: string,
  recipeId: string,
  recipeName: string,
  minutes: number,
): Promise<void> => {
  if (minutes <= 0) return;
  await requestNotificationPermissions();
  const durationSeconds = Math.round(minutes * 60);
  const endTimeMs = Date.now() + durationSeconds * 1000;
  const completionNotifIds = await scheduleTimerCompleteNotification(timerId, recipeName, endTimeMs);
  await timerStore.getState().add({
    id: timerId,
    recipeId,
    recipeName,
    durationSeconds,
    endTimeMs,
    isPaused: false,
    remainingMsOnPause: 0,
    completionNotifIds,
  });
};

/** Stops and removes a timer, cancelling all of its alarm notifications. */
export const stopTimer = async (timerId: string): Promise<void> => {
  const entry = timerStore.getState().timers[timerId];
  if (entry !== undefined) {
    await cancelNotifications(entry.completionNotifIds);
  }
  await timerStore.getState().remove(timerId);
};

/** Pauses a running timer, cancelling scheduled notifications until resumed. */
export const pauseTimer = async (timerId: string): Promise<void> => {
  const entry = timerStore.getState().timers[timerId];
  if (entry === undefined || entry.isPaused) return;
  await cancelNotifications(entry.completionNotifIds);
  await timerStore.getState().pause(timerId);
};

/** Resumes a paused timer, re-scheduling all alarm notifications. */
export const resumeTimer = async (timerId: string): Promise<void> => {
  const entry = timerStore.getState().timers[timerId];
  if (entry === undefined || !entry.isPaused) return;
  const newEndTimeMs = Date.now() + entry.remainingMsOnPause;
  const completionNotifIds = await scheduleTimerCompleteNotification(timerId, entry.recipeName, newEndTimeMs);
  timerStore.setState((s) => {
    const cur = s.timers[timerId];
    if (cur === undefined) return s;
    return { timers: { ...s.timers, [timerId]: { ...cur, completionNotifIds } } };
  });
  await timerStore.getState().resume(timerId, newEndTimeMs);
};
