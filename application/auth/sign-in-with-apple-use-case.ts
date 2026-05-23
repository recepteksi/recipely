import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Triggers the native Apple Sign-In sheet (iOS/macOS only) and persists the
 * resulting session. Delegates entirely to `IAuthRepository.signInWithApple`.
 */
export class SignInWithAppleUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(): Promise<Result<AuthSession, Failure>> {
    return this.repo.signInWithApple();
  }
}
