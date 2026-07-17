import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Terminates the current user session by clearing all persisted credentials.
 */
export class SignOutUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(): Promise<Result<void, Failure>> {
    return this.repo.signOut();
  }
}
