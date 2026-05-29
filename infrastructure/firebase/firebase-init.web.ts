import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Web Firebase config. Public — Firebase web config strings are not secrets,
// they identify the project and are bundled into every Firebase Hosting page.
// Real security is enforced server-side via Firebase Auth + security rules.
const firebaseConfig = {
  apiKey: 'AIzaSyDzcZhhR0NqMidRDN8q3kyhjDaES3tVEDM',
  authDomain: 'recipely-c05fc.firebaseapp.com',
  projectId: 'recipely-c05fc',
  storageBucket: 'recipely-c05fc.firebasestorage.app',
  messagingSenderId: '421167568469',
  appId: '1:421167568469:web:bc0817cca8488f9cec26dc',
  measurementId: 'G-RWE807696M',
} as const;

let appInstance: FirebaseApp | null = null;

const getOrInitApp = (): FirebaseApp => {
  if (appInstance !== null) return appInstance;
  const existing = getApps();
  appInstance = existing.length > 0 ? existing[0]! : initializeApp(firebaseConfig);
  return appInstance;
};

/**
 * Initializes Firebase for the web build. Boots the JS SDK with the public
 * web config (`@react-native-firebase/*` modules don't ship for web, so we
 * route through `firebase/app` here) and wires Analytics when the browser
 * supports it (some embedded webviews and SSR don't).
 */
export const initFirebase = async (): Promise<void> => {
  const app = getOrInitApp();
  try {
    const supported = await isAnalyticsSupported();
    if (supported) getAnalytics(app);
  } catch (err) {
    console.warn('[firebase-init.web] analytics init skipped:', err);
  }
};
