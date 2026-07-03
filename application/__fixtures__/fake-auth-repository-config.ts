import type { Failure } from '@core/failure';
import type { Result } from '@core/result/result';
import type { AuthSession } from '@domain/auth/auth-session';
import type { RegistrationChallenge } from '@domain/auth/registration-challenge';

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
  updateProfileResult?: Result<AuthSession, Failure>;
}
