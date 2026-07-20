import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RegistrationChallenge } from '@domain/auth/registration-challenge';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Starts registration by requesting a verification code email for the given
 * credentials. The account is not created until `VerifyRegistrationUseCase`
 * confirms the emailed code.
 */
export class RequestRegistrationUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(
    email: string,
    password: string,
    displayName: string,
  ): Promise<Result<RegistrationChallenge, Failure>> {
    return this.repo.requestRegistration(email, password, displayName);
  }
}
