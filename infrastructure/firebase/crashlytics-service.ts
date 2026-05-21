import { Platform } from 'react-native';
import {
  getCrashlytics,
  log,
  recordError,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';

// Thin guarded wrappers around Firebase Crashlytics. Every call fails silently
// when the native module is unavailable (web, or Expo Go without a dev build).

/** Enables or disables crash reporting collection (kept off in development). */
export const setCrashReportingEnabled = async (enabled: boolean): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await setCrashlyticsCollectionEnabled(getCrashlytics(), enabled);
  } catch {
    // Firebase native module unavailable — no-op.
  }
};

/** Records a non-fatal error to Crashlytics, optionally preceded by a context breadcrumb. */
export const recordCrash = (error: unknown, context?: string): void => {
  if (Platform.OS === 'web') return;
  try {
    const crashlytics = getCrashlytics();
    if (context !== undefined) log(crashlytics, context);
    recordError(crashlytics, error instanceof Error ? error : new Error(String(error)));
  } catch {
    // no-op
  }
};

/** Adds a breadcrumb attached to the next crash report. */
export const logCrashBreadcrumb = (message: string): void => {
  if (Platform.OS === 'web') return;
  try {
    log(getCrashlytics(), message);
  } catch {
    // no-op
  }
};
