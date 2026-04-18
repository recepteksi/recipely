import { fail, ok, type Result } from '@core/result/result';
import { type Failure, UnknownFailure, ValidationFailure } from '@core/failure';
import { AuthSession } from '@domain/auth/auth-session';
import { User } from '@domain/auth/user';
import { Email } from '@domain/common/email';
import { kvStore } from './kv-store';

const STORAGE_KEY = 'layerly.session.v1';

interface SerializedSession {
  id: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    photoUrl?: string;
  };
}

export class SecureTokenStorage {
  async saveSession(session: AuthSession): Promise<Result<void, Failure>> {
    try {
      const payload: SerializedSession = {
        id: session.id,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt.toISOString(),
        user: {
          id: session.user.id,
          email: session.user.email.value,
          displayName: session.user.displayName,
          photoUrl: session.user.photoUrl,
        },
      };
      await kvStore.setItem(STORAGE_KEY, JSON.stringify(payload));
      return ok(undefined);
    } catch (error: unknown) {
      if (__DEV__) {
        console.error('[SecureTokenStorage] saveSession failed:', error);
      }
      return fail(new UnknownFailure('Failed to persist session', error));
    }
  }

  async loadSession(): Promise<Result<AuthSession | null, Failure>> {
    let raw: string | null;
    try {
      raw = await kvStore.getItem(STORAGE_KEY);
    } catch (error: unknown) {
      if (__DEV__) {
        console.error('[SecureTokenStorage] loadSession failed:', error);
      }
      return fail(new UnknownFailure('Failed to read session', error));
    }
    if (raw === null) {
      return ok(null);
    }
    let parsed: SerializedSession;
    try {
      parsed = JSON.parse(raw) as SerializedSession;
    } catch {
      return fail(new ValidationFailure('Stored session is malformed JSON'));
    }
    const emailResult = Email.create(parsed.user.email);
    if (!emailResult.ok) {
      return fail(emailResult.failure);
    }
    const userResult = User.create({
      id: parsed.user.id,
      email: emailResult.value,
      displayName: parsed.user.displayName,
      photoUrl: parsed.user.photoUrl,
    });
    if (!userResult.ok) {
      return fail(userResult.failure);
    }
    const expiresAt = new Date(parsed.expiresAt);
    const sessionResult = AuthSession.create({
      id: parsed.id,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresAt,
      user: userResult.value,
    });
    if (!sessionResult.ok) {
      return fail(sessionResult.failure);
    }
    return ok(sessionResult.value);
  }

  async clear(): Promise<Result<void, Failure>> {
    try {
      await kvStore.removeItem(STORAGE_KEY);
      return ok(undefined);
    } catch (error: unknown) {
      return fail(new UnknownFailure('Failed to clear session', error));
    }
  }
}
