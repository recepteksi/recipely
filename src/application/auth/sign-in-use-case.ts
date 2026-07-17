import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Authenticates a user with email and password, returning a persisted
 * `AuthSession` on success.
 */
export class SignInUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(email: string, password: string): Promise<Result<AuthSession, Failure>> {
    return this.repo.signIn(email, password);
  }
}
