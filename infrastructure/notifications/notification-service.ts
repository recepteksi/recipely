import { LogBox, Platform } from 'react-native';
import type * as NotificationsType from 'expo-notifications';

// WHY: expo-notifications logs console.error on Android Expo Go (SDK 53+) at
// module load time. ES `import` is hoisted before any code, so suppression
// registered after the import comes too late. `import type` is erased at
// runtime (no module loading), so LogBox.ignoreLogs registers first and the
// pattern is active before `require` triggers expo-notifications initialization.
if (__DEV__) {
  LogBox.ignoreLogs([
    'expo-notifications: Android Push notifications',
    '`expo-notifications` functionality is not fully supported',
  ]);
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications = require('expo-notifications') as typeof NotificationsType;

// Android channel uses USAGE_ALARM (numeric 4) so the OS routes the sound
// through the Alarm volume slider, not the Notification slider. This means
// the alarm fires even if the user has notification volume low, matching the
// behaviour of system alarm clocks.
const ALERT_CHANNEL = 'recipely-timer-alert-v2';

export const TIMER_COMPLETE = 'timer-complete';

// How many reminder notifications to schedule after the main one, and the
// gap between them. 5 reminders × 2 min = alarm rings every 2 min for 10 min.
const REMINDER_COUNT = 5;
const REMINDER_INTERVAL_MS = 2 * 60 * 1000;

/** Must be called once at app startup (no-op on web). */
export const initNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ALERT_CHANNEL, {
        name: 'Cooking Timer (alarm)',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        enableVibrate: true,
        vibrationPattern: [0, 500, 300, 500, 300, 500],
        // Route audio through the Alarm volume stream so it rings loudly
        // even when notification volume is turned down.
        audioAttributes: {
          usage: 4,        // AudioUsage.ALARM
          contentType: 4,  // AudioContentType.SONIFICATION
        },
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

const scheduleSingle = async (
  timerId: string,
  recipeName: string,
  fireAtMs: number,
): Promise<string | null> => {
  const delaySeconds = Math.max(1, Math.round((fireAtMs - Date.now()) / 1000));
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${recipeName}`,
        body: 'Timer is done! Tap to dismiss.',
        sound: 'default',
        data: { type: TIMER_COMPLETE, timerId, recipeName },
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

/**
 * Schedules the completion notification plus follow-up reminders so the alarm
 * keeps firing every 2 minutes until the user dismisses it from the app.
 * Returns all scheduled notification IDs (main first, then reminders).
 */
export const scheduleTimerCompleteNotification = async (
  timerId: string,
  recipeName: string,
  endTimeMs: number,
): Promise<string[]> => {
  if (Platform.OS === 'web') return [];
  const ids: string[] = [];
  const all = [endTimeMs];
  for (let i = 1; i <= REMINDER_COUNT; i++) {
    all.push(endTimeMs + i * REMINDER_INTERVAL_MS);
  }
  const results = await Promise.all(all.map((t) => scheduleSingle(timerId, recipeName, t)));
  for (const id of results) {
    if (id !== null) ids.push(id);
  }
  return ids;
};

/** Cancels a list of displayed and scheduled notifications. */
export const cancelNotifications = async (notifIds: string[]): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Promise.allSettled(
    notifIds.flatMap((id) => [
      Notifications.dismissNotificationAsync(id),
      Notifications.cancelScheduledNotificationAsync(id),
    ]),
  );
};
