import axios from 'axios';
import { fail, ok, type Result } from '@core/result/result';
import { type Failure, UnauthorizedFailure, UnknownFailure } from '@core/failure';
import { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import type { DummyJsonLoginDto } from '@infrastructure/auth/user-info-dto';
import { toUser } from '@infrastructure/auth/user-info-mapper';
import type { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';

const AUTH_URL = 'https://dummyjson.com/auth/login';
const DEFAULT_EXPIRES_MS = 3_600_000;

export class AuthRepository implements IAuthRepository {
  constructor(private readonly storage: SecureTokenStorage) {}

  async signIn(username: string, password: string): Promise<Result<AuthSession, Failure>> {
    let dto: DummyJsonLoginDto;
    try {
      const response = await axios.post<DummyJsonLoginDto>(AUTH_URL, {
        username,
        password,
        expiresInMins: 60,
      });
      dto = response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return fail(new UnauthorizedFailure('Invalid username or password'));
      }
      return fail(new UnknownFailure('Login failed', error));
    }

    const userResult = toUser(dto);
    if (!userResult.ok) {
      return userResult;
    }

    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRES_MS);
    const sessionResult = AuthSession.create({
      id: String(dto.id),
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
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
      return fail(new UnknownFailure('sign_out_failed', clearResult.failure));
    }
    return ok(undefined);
  }

  async getCurrentSession(): Promise<Result<AuthSession | null, Failure>> {
    return this.storage.loadSession();
  }
}
