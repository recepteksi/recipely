import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Sends a password-reset link email. Resolves ok regardless of whether the
 * email exists — enumeration-safe.
 */
export class RequestPasswordResetUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(email: string): Promise<Result<void, Failure>> {
    return this.repo.requestPasswordReset(email);
  }
}
