import { setAnalyticsEnabled } from '@infrastructure/firebase/analytics-service';
import { setCrashReportingEnabled } from '@infrastructure/firebase/crashlytics-service';

/**
 * Initializes Firebase data collection. Firebase itself auto-initializes from
 * `google-services.json` / `GoogleService-Info.plist` at app launch — this only
 * toggles Analytics and Crashlytics collection off in development so dev
 * activity doesn't pollute production metrics.
 */
export const initFirebase = async (): Promise<void> => {
  const collect = !__DEV__;
  await Promise.allSettled([
    setAnalyticsEnabled(collect),
    setCrashReportingEnabled(collect),
  ]);
};
