import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Confirms the emailed registration code and, on success, creates the account
 * and returns a persisted `AuthSession`.
 */
export class VerifyRegistrationUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(email: string, code: string): Promise<Result<AuthSession, Failure>> {
    return this.repo.verifyRegistration(email, code);
  }
}
