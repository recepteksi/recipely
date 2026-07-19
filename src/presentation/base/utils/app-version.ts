import Constants from 'expo-constants';

/**
 * The application version as declared in `app.json` (`expo.version`), read at
 * runtime from the embedded manifest so version rows never go stale when the
 * app is bumped. The fallback only shows if the manifest is unavailable.
 */
export const appVersion: string = Constants.expoConfig?.version ?? '0.0.0';
