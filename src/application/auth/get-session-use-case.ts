import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Retrieves the currently persisted `AuthSession`, or `null` if no session
 * exists (unauthenticated state).
 */
export class GetSessionUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(): Promise<Result<AuthSession | null, Failure>> {
    return this.repo.getCurrentSession();
  }
}
