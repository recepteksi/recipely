import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Web Firebase config is read from EXPO_PUBLIC_FIREBASE_* env vars at build
// time. Firebase web config strings are technically public (they identify the
// project and end up in the client bundle either way), but routing them
// through env vars keeps GitHub Secret Scanning happy and lets us swap
// projects per environment without touching code. Hardening happens server
// side via Firebase Auth + Security Rules and the GCP API-key restrictions.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

let appInstance: FirebaseApp | null = null;

const getOrInitApp = (): FirebaseApp | null => {
  if (appInstance !== null) return appInstance;
  if (
    firebaseConfig.apiKey === undefined ||
    firebaseConfig.projectId === undefined ||
    firebaseConfig.appId === undefined
  ) {
    console.warn(
      '[firebase-init.web] EXPO_PUBLIC_FIREBASE_* env vars missing — skipping init',
    );
    return null;
  }
  const existing = getApps();
  appInstance = existing.length > 0
    ? existing[0]!
    : initializeApp(firebaseConfig as Record<string, string>);
  return appInstance;
};

/**
 * Initializes Firebase for the web build. Boots the JS SDK with the public
 * web config (`@react-native-firebase/*` modules don't ship for web, so we
 * route through `firebase/app` here) and wires Analytics when the browser
 * supports it (some embedded webviews and SSR don't). No-op if config env
 * vars aren't injected at build time.
 */
export const initFirebase = async (): Promise<void> => {
  const app = getOrInitApp();
  if (app === null) return;
  try {
    const supported = await isAnalyticsSupported();
    if (supported) getAnalytics(app);
  } catch (err) {
    console.warn('[firebase-init.web] analytics init skipped:', err);
  }
};
