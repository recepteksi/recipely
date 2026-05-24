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

// WHY: only one notification — the in-app expo-av loop is the continuous
// alarm. Reminder notifications caused repeated dings every 2 min which
// felt like spam rather than an alarm. User dismisses via the alarm screen
// or the "Kapat" action on the single notification.
const REMINDER_COUNT = 0;

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
        // WHY: 'alarm' (custom sound) requires the mp3 to be bundled in a
        // native build. Using 'default' so the notification makes noise on
        // devices that haven't rebuilt yet. Bump channel ID to v4 when a
        // build with alarm.mp3 in res/raw is released.
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
        // iOS reads sound from content; Android ignores it (channel sets sound).
        // Using 'default' until a native build bundles alarm.mp3 in the app.
        sound: Platform.OS === 'ios' ? 'default' : undefined,
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
 * Schedules the timer completion notification.
 * Returns the scheduled notification ID(s) so they can be cancelled on dismiss.
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
    all.push(endTimeMs + (i * 2 * 60 * 1000));
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
