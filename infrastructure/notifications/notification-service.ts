import { LogBox, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// WHY: expo-notifications logs console.error about push notifications being
// unavailable in Expo Go (SDK 53+). Local notifications still work. This
// suppresses the noise so the dev overlay doesn't show a false alarm.
if (__DEV__) {
  LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
}

// Two channels: the live countdown is re-posted every second so it must be
// silent + low importance; the one-shot completion alert is high importance.
const PROGRESS_CHANNEL = 'recipely-timer-progress';
const ALERT_CHANNEL = 'recipely-timer-alert';

// Categories attach action buttons to the running notification. A running
// timer offers Pause + Cancel; a paused timer offers Resume + Cancel.
const CATEGORY_RUNNING = 'recipely-timer-running';
const CATEGORY_PAUSED = 'recipely-timer-paused';

const TIMER_PROGRESS = 'timer-progress';
const TIMER_COMPLETE = 'timer-complete';

export const TIMER_ACTION_PAUSE = 'timer-pause';
export const TIMER_ACTION_RESUME = 'timer-resume';
export const TIMER_ACTION_CANCEL = 'timer-cancel';

export interface TimerActionLabels {
  pause: string;
  resume: string;
  cancel: string;
}

export interface TimerActionEvent {
  timerId: string;
  action: 'pause' | 'resume' | 'cancel';
}

const pad = (n: number): string => String(n).padStart(2, '0');

const formatMMSS = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
};

const progressContent = (
  timerId: string,
  recipeName: string,
  remainingSeconds: number,
  paused: boolean,
): Notifications.NotificationContentInput => ({
  title: `${paused ? '⏸' : '⏱'} ${recipeName}`,
  body: formatMMSS(remainingSeconds),
  data: { type: TIMER_PROGRESS, timerId },
  categoryIdentifier: paused ? CATEGORY_PAUSED : CATEGORY_RUNNING,
  sticky: true,
  autoDismiss: false,
  sound: false,
});

/** Must be called once at app startup (no-op on web). */
export const initNotifications = async (labels: TimerActionLabels): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const type = notification.request.content.data?.['type'];
        if (type === TIMER_PROGRESS) {
          // Live countdown re-post: refresh the shade entry silently, no banner.
          return {
            shouldShowBanner: false,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }
        return {
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        };
      },
    });

    await Notifications.setNotificationCategoryAsync(CATEGORY_RUNNING, [
      { identifier: TIMER_ACTION_PAUSE, buttonTitle: labels.pause, options: { opensAppToForeground: false } },
      { identifier: TIMER_ACTION_CANCEL, buttonTitle: labels.cancel, options: { opensAppToForeground: false, isDestructive: true } },
    ]);
    await Notifications.setNotificationCategoryAsync(CATEGORY_PAUSED, [
      { identifier: TIMER_ACTION_RESUME, buttonTitle: labels.resume, options: { opensAppToForeground: false } },
      { identifier: TIMER_ACTION_CANCEL, buttonTitle: labels.cancel, options: { opensAppToForeground: false, isDestructive: true } },
    ]);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(PROGRESS_CHANNEL, {
        name: 'Cooking Timer (running)',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        enableVibrate: false,
        vibrationPattern: [0],
        showBadge: false,
      });
      await Notifications.setNotificationChannelAsync(ALERT_CHANNEL, {
        name: 'Cooking Timer (done)',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  } catch {
    // Notifications unavailable (e.g. Expo Go limitations). Timers still run.
  }
};

/** Returns true when the user granted notification permission. */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

/**
 * Posts the sticky live-countdown notification (with Pause + Cancel buttons)
 * that stays in the shade for the whole timer. Returns its identifier.
 */
export const showTimerNotification = async (
  timerId: string,
  recipeName: string,
  remainingSeconds: number,
): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: progressContent(timerId, recipeName, remainingSeconds, false),
      trigger: Platform.OS === 'android' ? { channelId: PROGRESS_CHANNEL } : null,
    });
  } catch {
    return null;
  }
};

/**
 * Re-posts the countdown notification under the same identifier so the time
 * ticks down in place and the Pause/Resume button reflects `paused`.
 * Android-only — iOS would show a banner on every update.
 */
export const updateTimerNotification = async (
  notifId: string,
  timerId: string,
  recipeName: string,
  remainingSeconds: number,
  paused: boolean,
): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: notifId,
      content: progressContent(timerId, recipeName, remainingSeconds, paused),
      trigger: { channelId: PROGRESS_CHANNEL },
    });
  } catch {
    // ignore — notification may have been dismissed
  }
};

/** Schedules the one-shot "timer done" alert to fire at `endTimeMs`. */
export const scheduleTimerCompleteNotification = async (
  recipeName: string,
  endTimeMs: number,
): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  const delaySeconds = Math.max(1, Math.round((endTimeMs - Date.now()) / 1000));
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `✅ ${recipeName}`,
        body: 'Timer is done!',
        sound: 'default',
        data: { type: TIMER_COMPLETE },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        ...(Platform.OS === 'android' && { channelId: ALERT_CHANNEL }),
      },
    });
  } catch {
    return null;
  }
};

/** Removes a displayed notification (used when a timer's countdown reaches zero). */
export const dismissTimerNotification = async (notifId: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.dismissNotificationAsync(notifId);
  } catch {
    // ignore
  }
};

/** Cancels both a displayed and a scheduled notification for the same id. */
export const cancelNotification = async (notifId: string | null): Promise<void> => {
  if (notifId === null || Platform.OS === 'web') return;
  try {
    await Promise.allSettled([
      Notifications.dismissNotificationAsync(notifId),
      Notifications.cancelScheduledNotificationAsync(notifId),
    ]);
  } catch {
    // ignore — notification may have already been dismissed
  }
};

/**
 * Subscribes to Pause / Resume / Cancel button presses on timer notifications.
 * The returned object's `remove()` unsubscribes.
 */
export const addTimerActionListener = (
  handler: (event: TimerActionEvent) => void,
): { remove: () => void } => {
  if (Platform.OS === 'web') return { remove: () => undefined };
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const timerId = response.notification.request.content.data?.['timerId'];
    if (typeof timerId !== 'string') return;
    switch (response.actionIdentifier) {
      case TIMER_ACTION_PAUSE:
        handler({ timerId, action: 'pause' });
        break;
      case TIMER_ACTION_RESUME:
        handler({ timerId, action: 'resume' });
        break;
      case TIMER_ACTION_CANCEL:
        handler({ timerId, action: 'cancel' });
        break;
      default:
        break;
    }
  });
  return subscription;
};
