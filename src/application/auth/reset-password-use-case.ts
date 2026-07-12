import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Completes a password reset using the token from the emailed link. Does
 * not create a new session — the user must sign in after resetting.
 */
export class ResetPasswordUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(token: string, newPassword: string): Promise<Result<void, Failure>> {
    return this.repo.resetPassword(token, newPassword);
  }
}
