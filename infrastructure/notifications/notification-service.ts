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

// WHY: channel ID bumped to v3 because Android does not allow changing the
// sound of an existing channel — a new ID is the only way to apply the
// custom alarm.mp3 sound to future notifications.
const ALERT_CHANNEL = 'recipely-timer-alert-v3';

export const TIMER_COMPLETE = 'timer-complete';

// Notification category / action identifiers — shared with the sync hook so
// there are no magic strings at the call site.
export const TIMER_ALERT_CATEGORY = 'TIMER_ALERT';
export const DISMISS_ALARM_ACTION = 'DISMISS_ALARM';

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

    // Register the "Kapat" action button — shown on both iOS (long-press /
    // expanded notification) and Android (notification action row).
    await Notifications.setNotificationCategoryAsync(TIMER_ALERT_CATEGORY, [
      {
        identifier: DISMISS_ALARM_ACTION,
        buttonTitle: 'Kapat',
        options: {
          isDestructive: true,
          // opensAppToForeground: false lets the action run without bringing
          // the app to the foreground. If the app is fully killed the OS may
          // still open it briefly, but the intent is minimal interruption.
          opensAppToForeground: false,
        },
      },
    ]);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ALERT_CHANNEL, {
        name: 'Cooking Timer (alarm)',
        importance: Notifications.AndroidImportance.MAX,
        // 'alarm' references assets/sounds/alarm.mp3 bundled via expo-notifications
        // sounds config (extension omitted per Android convention).
        sound: 'alarm',
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
        // iOS uses the sound field in the content; Android reads sound from
        // the channel (setting it here on Android is a no-op).
        sound: Platform.OS === 'ios' ? 'alarm.mp3' : undefined,
        categoryIdentifier: TIMER_ALERT_CATEGORY,
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
