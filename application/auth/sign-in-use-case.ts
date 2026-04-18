import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

export class SignInUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(username: string, password: string): Promise<Result<AuthSession, Failure>> {
    return this.repo.signIn(username, password);
  }
}
