import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

export class SignUpUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(
    email: string,
    password: string,
    displayName: string,
  ): Promise<Result<AuthSession, Failure>> {
    return this.repo.signUp(email, password, displayName);
  }
}
