import { type Failure, UnknownFailure } from '@core/failure';
import { fail, ok, type Result } from '@core/result/result';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

export interface FakeAuthRepositoryConfig {
  signInResult?: Result<AuthSession, Failure>;
  signUpResult?: Result<AuthSession, Failure>;
  signOutResult?: Result<void, Failure>;
  currentSessionResult?: Result<AuthSession | null, Failure>;
}

export class FakeAuthRepository implements IAuthRepository {
  constructor(private readonly config: FakeAuthRepositoryConfig = {}) {}

  signIn(_email: string, _password: string): Promise<Result<AuthSession, Failure>> {
    return Promise.resolve(
      this.config.signInResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  signUp(
    _email: string,
    _password: string,
    _displayName: string,
  ): Promise<Result<AuthSession, Failure>> {
    return Promise.resolve(
      this.config.signUpResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  signOut(): Promise<Result<void, Failure>> {
    return Promise.resolve(this.config.signOutResult ?? ok(undefined));
  }

  getCurrentSession(): Promise<Result<AuthSession | null, Failure>> {
    return Promise.resolve(this.config.currentSessionResult ?? ok(null));
  }
}
