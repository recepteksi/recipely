import { fail, ok, type Result } from '@core/result/result';
import { type Failure, UnauthorizedFailure } from '@core/failure';
import { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import type { RegistrationChallenge } from '@domain/auth/registration-challenge';
import {
  AUTH_FORGOT_PASSWORD_PATH,
  AUTH_LOGIN_PATH,
  AUTH_REGISTER_PATH,
  AUTH_REGISTER_RESEND_PATH,
  AUTH_REGISTER_VERIFY_PATH,
  AUTH_RESET_PASSWORD_PATH,
  AUTH_SOCIAL_PATH,
  AVATAR_UPLOAD_URL,
  DEFAULT_CODE_TTL_SECONDS,
  ME_PROFILE_PATH,
} from '@infrastructure/constants/api';
import type { HttpClient } from '@infrastructure/network/http-client';
import { appendFilePart } from '@infrastructure/network/append-file-part';
import { decodeJwtPayload } from '@infrastructure/network/decode-jwt';
import type {
  RecipelyAuthSessionDto,
  RecipelyUserDto,
} from '@infrastructure/auth/user-info-dto';
import type { RegistrationChallengeDto } from '@infrastructure/auth/registration-challenge-dto';
import { toUser } from '@infrastructure/auth/user-info-mapper';
import type { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';
import {
  acquireAppleFirebaseToken,
  acquireGoogleFirebaseToken,
} from '@infrastructure/auth/social-auth-provider';

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
  ) {}

  async signIn(email: string, password: string): Promise<Result<AuthSession, Failure>> {
    const result = await this.http.request<RecipelyAuthSessionDto>({
      method: 'POST',
      url: AUTH_LOGIN_PATH,
      data: { email: email.trim(), password },
    });
    if (!result.ok) {
      return result;
    }
    return this.persistSession(result.value);
  }

  async requestRegistration(
    email: string,
    password: string,
    displayName: string,
  ): Promise<Result<RegistrationChallenge, Failure>> {
    const result = await this.http.request<RegistrationChallengeDto>({
      method: 'POST',
      url: AUTH_REGISTER_PATH,
      data: { email: email.trim(), password, displayName },
    });
    if (!result.ok) {
      return result;
    }
    return ok(toChallenge(email.trim(), result.value));
  }

  async verifyRegistration(
    email: string,
    code: string,
  ): Promise<Result<AuthSession, Failure>> {
    const result = await this.http.request<RecipelyAuthSessionDto>({
      method: 'POST',
      url: AUTH_REGISTER_VERIFY_PATH,
      data: { email: email.trim(), code: code.trim() },
    });
    if (!result.ok) {
      return result;
    }
    return this.persistSession(result.value);
  }

  async resendRegistrationCode(
    email: string,
  ): Promise<Result<RegistrationChallenge, Failure>> {
    const result = await this.http.request<RegistrationChallengeDto>({
      method: 'POST',
      url: AUTH_REGISTER_RESEND_PATH,
      data: { email: email.trim() },
    });
    if (!result.ok) {
      return result;
    }
    return ok(toChallenge(email.trim(), result.value));
  }

  async signInWithGoogle(): Promise<Result<AuthSession, Failure>> {
    const tokenResult = await acquireGoogleFirebaseToken();
    if (!tokenResult.ok) return tokenResult;
    return this.exchangeFirebaseToken(tokenResult.value);
  }

  async signInWithApple(): Promise<Result<AuthSession, Failure>> {
    const tokenResult = await acquireAppleFirebaseToken();
    if (!tokenResult.ok) return tokenResult;
    return this.exchangeFirebaseToken(tokenResult.value);
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

  async requestPasswordReset(email: string): Promise<Result<void, Failure>> {
    const result = await this.http.request<void>({
      method: 'POST',
      url: AUTH_FORGOT_PASSWORD_PATH,
      data: { email: email.trim() },
    });
    if (!result.ok) {
      return result;
    }
    return ok(undefined);
  }

  async resetPassword(token: string, newPassword: string): Promise<Result<void, Failure>> {
    const result = await this.http.request<void>({
      method: 'POST',
      url: AUTH_RESET_PASSWORD_PATH,
      data: { token, newPassword },
    });
    if (!result.ok) {
      return result;
    }
    return ok(undefined);
  }

  async uploadAvatar(
    fileUri: string,
    fileName: string,
    mimeType: string,
  ): Promise<Result<AuthSession, Failure>> {
    const formData = new FormData();
    await appendFilePart(formData, 'avatar', { uri: fileUri, fileName, mimeType });

    const result = await this.http.uploadMultipart<{ user: RecipelyUserDto }>(
      AVATAR_UPLOAD_URL,
      formData,
    );
    if (!result.ok) {
      return result;
    }

    // The avatar endpoint returns only the updated user — no token. Reuse the
    // current session's token/expiry/id so the user stays signed in.
    const sessionResult = await this.storage.loadSession();
    if (!sessionResult.ok) {
      return fail(sessionResult.failure);
    }
    const current = sessionResult.value;
    if (current === null) {
      return fail(new UnauthorizedFailure('No active session to update'));
    }

    const userResult = toUser(result.value.user);
    if (!userResult.ok) return userResult;

    const updatedResult = AuthSession.create({
      id: current.id,
      accessToken: current.accessToken,
      expiresAt: current.expiresAt,
      user: userResult.value,
    });
    if (!updatedResult.ok) return updatedResult;

    const saveResult = await this.storage.saveSession(updatedResult.value);
    if (!saveResult.ok) return fail(saveResult.failure);
    return ok(updatedResult.value);
  }

  async updateProfile(input: {
    displayName?: string;
    bio?: string;
  }): Promise<Result<AuthSession, Failure>> {
    const result = await this.http.request<{ user: RecipelyUserDto }>({
      method: 'PATCH',
      url: ME_PROFILE_PATH,
      data: input,
    });
    if (!result.ok) {
      return result;
    }

    // The profile endpoint returns only the updated user — no token. Reuse the
    // current session's token/expiry/id so the user stays signed in.
    const sessionResult = await this.storage.loadSession();
    if (!sessionResult.ok) {
      return fail(sessionResult.failure);
    }
    const current = sessionResult.value;
    if (current === null) {
      return fail(new UnauthorizedFailure('No active session to update'));
    }

    const userResult = toUser(result.value.user);
    if (!userResult.ok) return userResult;

    const updatedResult = AuthSession.create({
      id: current.id,
      accessToken: current.accessToken,
      expiresAt: current.expiresAt,
      user: userResult.value,
    });
    if (!updatedResult.ok) return updatedResult;

    const saveResult = await this.storage.saveSession(updatedResult.value);
    if (!saveResult.ok) return fail(saveResult.failure);
    return ok(updatedResult.value);
  }

  /** Sends a Firebase ID token to the backend and persists the returned backend JWT. */
  private async exchangeFirebaseToken(idToken: string): Promise<Result<AuthSession, Failure>> {
    const result = await this.http.request<RecipelyAuthSessionDto>({
      method: 'POST',
      url: AUTH_SOCIAL_PATH,
      data: { idToken },
    });
    if (!result.ok) return result;
    return this.persistSession(result.value);
  }

  /** Maps a backend session DTO to an `AuthSession` and persists it to storage. */
  private async persistSession(
    dto: RecipelyAuthSessionDto,
  ): Promise<Result<AuthSession, Failure>> {
    const userResult = toUser(dto.user);
    if (!userResult.ok) return userResult;

    const sessionResult = AuthSession.create({
      id: dto.user.id,
      accessToken: dto.token,
      expiresAt: expiresAtFromToken(dto.token),
      user: userResult.value,
    });
    if (!sessionResult.ok) return sessionResult;

    const saveResult = await this.storage.saveSession(sessionResult.value);
    if (!saveResult.ok) return fail(saveResult.failure);
    return ok(sessionResult.value);
  }
}

const toChallenge = (
  email: string,
  dto: RegistrationChallengeDto,
): RegistrationChallenge => {
  const expiresInSeconds = dto.expiresInSeconds ?? DEFAULT_CODE_TTL_SECONDS;
  // Prefer the backend's absolute expiry; synthesise one from the remaining
  // seconds only when an older backend omits it.
  const expiresAt =
    dto.expiresAt ?? new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  return {
    email: dto.email ?? email,
    expiresInSeconds,
    expiresAt,
  };
};

const expiresAtFromToken = (token: string): Date => {
  const claims = decodeJwtPayload(token);
  if (claims.ok && typeof claims.value.exp === 'number') {
    return new Date(claims.value.exp * 1000);
  }
  return new Date(Date.now() + FALLBACK_EXPIRES_MS);
};
