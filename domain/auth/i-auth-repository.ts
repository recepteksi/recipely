import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';

export interface IAuthRepository {
  signIn(username: string, password: string): Promise<Result<AuthSession, Failure>>;
  signOut(): Promise<Result<void, Failure>>;
  getCurrentSession(): Promise<Result<AuthSession | null, Failure>>;
}
