import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RegistrationChallenge } from '@domain/auth/registration-challenge';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/** Re-sends the registration verification code to a pending email. */
export class ResendRegistrationCodeUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(email: string): Promise<Result<RegistrationChallenge, Failure>> {
    return this.repo.resendRegistrationCode(email);
  }
}
