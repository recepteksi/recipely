import { fail, ok, type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '@infrastructure/constants/api';
import type { HttpClient } from '@infrastructure/network/http-client';
import { decodeJwtPayload } from '@infrastructure/network/decode-jwt';
import type { RecipelyAuthSessionDto } from '@infrastructure/auth/user-info-dto';
import { toUser } from '@infrastructure/auth/user-info-mapper';
import type { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';

const FALLBACK_EXPIRES_MS = 3_600_000;

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
}

const expiresAtFromToken = (token: string): Date => {
  const claims = decodeJwtPayload(token);
  if (claims.ok && typeof claims.value.exp === 'number') {
    return new Date(claims.value.exp * 1000);
  }
  return new Date(Date.now() + FALLBACK_EXPIRES_MS);
};
