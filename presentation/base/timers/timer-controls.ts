import { timerStore } from '@application/timers/timer-store';
import {
  requestNotificationPermissions,
  showTimerNotification,
  updateTimerNotification,
  scheduleTimerCompleteNotification,
  cancelNotification,
} from '@infrastructure/notifications/notification-service';

/**
 * Side-effecting timer operations shared by the in-app UI (`useRecipeTimer`)
 * and the notification action handler. Each one keeps the persistent
 * `timerStore` and the system notifications in sync.
 */

/** Starts a timer: schedules notifications and persists the entry. No-op for non-positive durations. */
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
  const [startNotifId, completionNotifId] = await Promise.all([
    showTimerNotification(timerId, recipeName, durationSeconds),
    scheduleTimerCompleteNotification(recipeName, endTimeMs),
  ]);
  await timerStore.getState().add({
    id: timerId,
    recipeId,
    recipeName,
    durationSeconds,
    endTimeMs,
    isPaused: false,
    remainingMsOnPause: 0,
    startNotifId,
    completionNotifId,
  });
};

/** Stops and removes a timer, cancelling all of its notifications. */
export const stopTimer = async (timerId: string): Promise<void> => {
  const entry = timerStore.getState().timers[timerId];
  if (entry !== undefined) {
    await Promise.all([
      cancelNotification(entry.startNotifId),
      cancelNotification(entry.completionNotifId),
    ]);
  }
  await timerStore.getState().remove(timerId);
};

/** Pauses a running timer, freezing the countdown and the notification. */
export const pauseTimer = async (timerId: string): Promise<void> => {
  const entry = timerStore.getState().timers[timerId];
  if (entry === undefined || entry.isPaused) return;
  await cancelNotification(entry.completionNotifId);
  await timerStore.getState().pause(timerId);
  const paused = timerStore.getState().timers[timerId];
  if (paused?.startNotifId != null) {
    await updateTimerNotification(
      paused.startNotifId,
      timerId,
      paused.recipeName,
      Math.round(paused.remainingMsOnPause / 1000),
      true,
    );
  }
};

/** Resumes a paused timer, re-scheduling the completion alert from the remaining time. */
export const resumeTimer = async (timerId: string): Promise<void> => {
  const entry = timerStore.getState().timers[timerId];
  if (entry === undefined || !entry.isPaused) return;
  const newEndTimeMs = Date.now() + entry.remainingMsOnPause;
  const completionNotifId = await scheduleTimerCompleteNotification(entry.recipeName, newEndTimeMs);
  timerStore.setState((s) => {
    const cur = s.timers[timerId];
    if (cur === undefined) return s;
    return { timers: { ...s.timers, [timerId]: { ...cur, completionNotifId } } };
  });
  await timerStore.getState().resume(timerId, newEndTimeMs);
  // The global notification syncer resumes per-second running-state updates.
};
