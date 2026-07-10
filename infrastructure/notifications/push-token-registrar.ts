import type { RegisterTokenFn } from '@infrastructure/notifications/register-token-fn';

/**
 * Native default: a no-op. Receiving FCM pushes on iOS/Android requires the
 * native `@react-native-firebase/messaging` module and a native rebuild, which
 * is intentionally out of scope here. The web counterpart
 * (`push-token-registrar.web.ts`) registers a token via the Firebase JS SDK.
 */
export const registerPushToken = async (_register: RegisterTokenFn): Promise<void> => {
  // Intentionally empty — see JSDoc.
};
