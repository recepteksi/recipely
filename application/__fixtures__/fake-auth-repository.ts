import { type Failure, UnknownFailure } from '@core/failure';
import { fail, ok, type Result } from '@core/result/result';
import type { AuthSession } from '@domain/auth/auth-session';
import type { RegistrationChallenge } from '@domain/auth/registration-challenge';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

export interface FakeAuthRepositoryConfig {
  signInResult?: Result<AuthSession, Failure>;
  requestRegistrationResult?: Result<RegistrationChallenge, Failure>;
  verifyRegistrationResult?: Result<AuthSession, Failure>;
  resendRegistrationCodeResult?: Result<RegistrationChallenge, Failure>;
  signOutResult?: Result<void, Failure>;
  currentSessionResult?: Result<AuthSession | null, Failure>;
  signInWithGoogleResult?: Result<AuthSession, Failure>;
  signInWithAppleResult?: Result<AuthSession, Failure>;
  uploadAvatarResult?: Result<AuthSession, Failure>;
}

/**
 * In-memory test double for `IAuthRepository`. Each method returns the
 * pre-configured `Result` from `FakeAuthRepositoryConfig`, defaulting to an
 * `UnknownFailure` (sign-in/up) or `ok(null)` (session) when not configured.
 */
export class FakeAuthRepository implements IAuthRepository {
  constructor(private readonly config: FakeAuthRepositoryConfig = {}) {}

  signIn(_email: string, _password: string): Promise<Result<AuthSession, Failure>> {
    return Promise.resolve(
      this.config.signInResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  requestRegistration(
    _email: string,
    _password: string,
    _displayName: string,
  ): Promise<Result<RegistrationChallenge, Failure>> {
    return Promise.resolve(
      this.config.requestRegistrationResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  verifyRegistration(_email: string, _code: string): Promise<Result<AuthSession, Failure>> {
    return Promise.resolve(
      this.config.verifyRegistrationResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  resendRegistrationCode(_email: string): Promise<Result<RegistrationChallenge, Failure>> {
    return Promise.resolve(
      this.config.resendRegistrationCodeResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  signOut(): Promise<Result<void, Failure>> {
    return Promise.resolve(this.config.signOutResult ?? ok(undefined));
  }

  getCurrentSession(): Promise<Result<AuthSession | null, Failure>> {
    return Promise.resolve(this.config.currentSessionResult ?? ok(null));
  }

  signInWithGoogle(): Promise<Result<AuthSession, Failure>> {
    return Promise.resolve(
      this.config.signInWithGoogleResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  signInWithApple(): Promise<Result<AuthSession, Failure>> {
    return Promise.resolve(
      this.config.signInWithAppleResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  requestPasswordReset(_email: string): Promise<Result<void, Failure>> {
    return Promise.resolve(ok(undefined));
  }

  resetPassword(_token: string, _newPassword: string): Promise<Result<void, Failure>> {
    return Promise.resolve(ok(undefined));
  }

  uploadAvatar(
    _fileUri: string,
    _fileName: string,
    _mimeType: string,
  ): Promise<Result<AuthSession, Failure>> {
    return Promise.resolve(
      this.config.uploadAvatarResult ?? fail(new UnknownFailure('not configured')),
    );
  }
}
