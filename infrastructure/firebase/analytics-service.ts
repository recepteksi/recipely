import { Platform } from 'react-native';
import {
  getAnalytics,
  logEvent,
  logScreenView,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';

// Thin guarded wrappers around Firebase Analytics. Every call fails silently
// when the native module is unavailable (web, or Expo Go without a dev build),
// so callers never need to branch on platform or Firebase availability.

/** Enables or disables analytics collection (kept off in development). */
export const setAnalyticsEnabled = async (enabled: boolean): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await setAnalyticsCollectionEnabled(getAnalytics(), enabled);
  } catch {
    // Firebase native module unavailable — no-op.
  }
};

/** Logs a custom analytics event. */
export const logAnalyticsEvent = async (
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await logEvent(getAnalytics(), name, params);
  } catch {
    // no-op
  }
};

/** Logs a screen view for screen-flow analytics. */
export const logScreen = async (screenName: string, screenClass?: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await logScreenView(getAnalytics(), {
      screen_name: screenName,
      screen_class: screenClass ?? screenName,
    });
  } catch {
    // no-op
  }
};
