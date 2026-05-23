import { fail, ok, type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { UnknownFailure } from '@core/failure';
import { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import {
  AUTH_LOGIN_PATH,
  AUTH_REGISTER_PATH,
  AUTH_SOCIAL_PATH,
  GOOGLE_WEB_CLIENT_ID,
} from '@infrastructure/constants/api';
import type { HttpClient } from '@infrastructure/network/http-client';
import { decodeJwtPayload } from '@infrastructure/network/decode-jwt';
import type { RecipelyAuthSessionDto } from '@infrastructure/auth/user-info-dto';
import { toUser } from '@infrastructure/auth/user-info-mapper';
import type { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';
import { generateNonce, hashNonce } from '@infrastructure/auth/nonce-generator';
import * as AppleAuthentication from 'expo-apple-authentication';

// WHY: static imports of @react-native-google-signin and @react-native-firebase/auth
// trigger TurboModule / RNFBAppModule initialisation at module-load time, crashing
// Expo Go before any try/catch can intervene. The IIFE catches that throw once;
// social sign-in methods return a graceful Failure when the module is unavailable.
type GoogleSigninMod = typeof import('@react-native-google-signin/google-signin');
type FirebaseAuthMod = typeof import('@react-native-firebase/auth');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleSigninMod: GoogleSigninMod | null = (() => { try { return require('@react-native-google-signin/google-signin') as GoogleSigninMod; } catch { return null; } })();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const firebaseAuthMod: FirebaseAuthMod | null = (() => { try { return require('@react-native-firebase/auth') as FirebaseAuthMod; } catch { return null; } })();

const FALLBACK_EXPIRES_MS = 3_600_000;

/**
 * Implements `IAuthRepository` against the Recipely backend (email/password)
 * and Firebase Auth (Google / Apple social sign-in). Social sign-in flows
 * obtain a Firebase ID token then exchange it for a backend JWT via
 * `POST /auth/social`, keeping all user records on the backend.
 */
export class AuthRepository implements IAuthRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly storage: SecureTokenStorage,
  ) {
    googleSigninMod?.GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  }

  async signIn(email: string, password: string): Promise<Result<AuthSession, Failure>> {
    const result = await this.http.request<RecipelyAuthSessionDto>({
      method: 'POST',
      url: AUTH_LOGIN_PATH,
      data: { email: email.trim(), password },
    });
    if (!result.ok) {
      return result;
    }

    const dto = result.value;
    const userResult = toUser(dto.user);
    if (!userResult.ok) {
      return userResult;
    }

    const expiresAt = expiresAtFromToken(dto.token);

    const sessionResult = AuthSession.create({
      id: dto.user.id,
      accessToken: dto.token,
      expiresAt,
      user: userResult.value,
    });
    if (!sessionResult.ok) {
      return sessionResult;
    }

    const saveResult = await this.storage.saveSession(sessionResult.value);
    if (!saveResult.ok) {
      return fail(saveResult.failure);
    }
    return ok(sessionResult.value);
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
  ): Promise<Result<AuthSession, Failure>> {
    const result = await this.http.request<RecipelyAuthSessionDto>({
      method: 'POST',
      url: AUTH_REGISTER_PATH,
      data: { email: email.trim(), password, displayName },
    });
    if (!result.ok) {
      return result;
    }

    const dto = result.value;
    const userResult = toUser(dto.user);
    if (!userResult.ok) {
      return userResult;
    }

    const expiresAt = expiresAtFromToken(dto.token);

    const sessionResult = AuthSession.create({
      id: dto.user.id,
      accessToken: dto.token,
      expiresAt,
      user: userResult.value,
    });
    if (!sessionResult.ok) {
      return sessionResult;
    }

    const saveResult = await this.storage.saveSession(sessionResult.value);
    if (!saveResult.ok) {
      return fail(saveResult.failure);
    }
    return ok(sessionResult.value);
  }

  async signInWithGoogle(): Promise<Result<AuthSession, Failure>> {
    if (googleSigninMod === null || firebaseAuthMod === null) {
      return fail(new UnknownFailure('Google Sign-In is not available in this build'));
    }
    const { GoogleSignin, isSuccessResponse } = googleSigninMod;
    const auth = firebaseAuthMod.default;
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        return fail(new UnknownFailure('Google sign-in was cancelled'));
      }
      const { idToken } = response.data;
      if (!idToken) {
        return fail(new UnknownFailure('Google did not return an ID token'));
      }
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const { user } = await auth().signInWithCredential(credential);
      const firebaseIdToken = await user.getIdToken();
      return this.exchangeFirebaseToken(firebaseIdToken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed';
      return fail(new UnknownFailure(msg));
    }
  }

  async signInWithApple(): Promise<Result<AuthSession, Failure>> {
    if (firebaseAuthMod === null) {
      return fail(new UnknownFailure('Apple Sign-In is not available in this build'));
    }
    const auth = firebaseAuthMod.default;
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        return fail(new UnknownFailure('Apple Sign-In is not available on this device'));
      }
      const rawNonce = generateNonce();
      const hashedNonce = await hashNonce(rawNonce);
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      const { identityToken } = appleCredential;
      if (!identityToken) {
        return fail(new UnknownFailure('Apple did not return an identity token'));
      }
      const credential = auth.AppleAuthProvider.credential(identityToken, rawNonce);
      const { user } = await auth().signInWithCredential(credential);
      const firebaseIdToken = await user.getIdToken();
      return this.exchangeFirebaseToken(firebaseIdToken);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Apple sign-in failed';
      return fail(new UnknownFailure(msg));
    }
  }

  async signOut(): Promise<Result<void, Failure>> {
    const clearResult = await this.storage.clear();
    if (!clearResult.ok) {
      return fail(clearResult.failure);
    }
    return ok(undefined);
  }

  async getCurrentSession(): Promise<Result<AuthSession | null, Failure>> {
    return this.storage.loadSession();
  }

  /** Sends a Firebase ID token to the backend and persists the returned backend JWT. */
  private async exchangeFirebaseToken(idToken: string): Promise<Result<AuthSession, Failure>> {
    const result = await this.http.request<RecipelyAuthSessionDto>({
      method: 'POST',
      url: AUTH_SOCIAL_PATH,
      data: { idToken },
    });
    if (!result.ok) return result;

    const dto = result.value;
    const userResult = toUser(dto.user);
    if (!userResult.ok) return userResult;

    const expiresAt = expiresAtFromToken(dto.token);
    const sessionResult = AuthSession.create({
      id: dto.user.id,
      accessToken: dto.token,
      expiresAt,
      user: userResult.value,
    });
    if (!sessionResult.ok) return sessionResult;

    const saveResult = await this.storage.saveSession(sessionResult.value);
    if (!saveResult.ok) return fail(saveResult.failure);
    return ok(sessionResult.value);
  }
}

const expiresAtFromToken = (token: string): Date => {
  const claims = decodeJwtPayload(token);
  if (claims.ok && typeof claims.value.exp === 'number') {
    return new Date(claims.value.exp * 1000);
  }
  return new Date(Date.now() + FALLBACK_EXPIRES_MS);
};
