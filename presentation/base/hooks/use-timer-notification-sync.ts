import { useEffect } from 'react';
import { timerStore } from '@application/timers/timer-store';
import {
  updateTimerNotification,
  dismissTimerNotification,
  addTimerActionListener,
} from '@infrastructure/notifications/notification-service';
import { stopTimer, pauseTimer, resumeTimer } from '@presentation/base/timers/timer-controls';

const TICK_MS = 1000;

/**
 * App-global timer/notification bridge, mounted once at the app root:
 *
 * 1. Once a second, refreshes every running timer's notification so the
 *    countdown ticks live in the shade. When a countdown hits zero the live
 *    notification is dismissed (the scheduled completion alert fires on its own).
 * 2. Listens for Pause / Resume / Cancel button presses on those notifications
 *    and applies them to the timer store.
 */
export const useTimerNotificationSync = (): void => {
  useEffect(() => {
    const interval = setInterval(() => {
      const { timers } = timerStore.getState();
      for (const entry of Object.values(timers)) {
        if (entry.isPaused || entry.startNotifId === null) continue;
        const remaining = Math.max(0, Math.round((entry.endTimeMs - Date.now()) / 1000));
        if (remaining > 0) {
          void updateTimerNotification(
            entry.startNotifId,
            entry.id,
            entry.recipeName,
            remaining,
            false,
          );
          continue;
        }
        const finishedNotifId = entry.startNotifId;
        timerStore.setState((s) => {
          const cur = s.timers[entry.id];
          if (cur === undefined) return s;
          return { timers: { ...s.timers, [entry.id]: { ...cur, startNotifId: null } } };
        });
        void dismissTimerNotification(finishedNotifId);
      }
    }, TICK_MS);

    const subscription = addTimerActionListener(({ timerId, action }) => {
      if (action === 'cancel') void stopTimer(timerId);
      else if (action === 'pause') void pauseTimer(timerId);
      else if (action === 'resume') void resumeTimer(timerId);
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);
};
