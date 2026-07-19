import { Entity } from '@core/entity/entity';
import { fail, ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { User } from '@domain/auth/user';
import { ValueConstants } from '@core/constants';

export interface AuthSessionProps {
  id: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: User;
}

/**
 * Domain entity that represents an authenticated user session, bundling the
 * access token, its expiry, and the associated `User`. Validates that `id`,
 * `accessToken`, and `expiresAt` are well-formed before construction.
 */
export class AuthSession extends Entity<AuthSessionProps> {
  private constructor(props: AuthSessionProps) {
    super(props);
  }

  static create(props: AuthSessionProps): Result<AuthSession, ValidationFailure> {
    if (props.id.trim().length === ValueConstants.zero) {
      return fail(new ValidationFailure('Session id must be non-empty', 'id'));
    }
    if (props.accessToken.trim().length === ValueConstants.zero) {
      return fail(new ValidationFailure('accessToken must be non-empty', 'accessToken'));
    }
    if (Number.isNaN(props.expiresAt.getTime())) {
      return fail(new ValidationFailure('expiresAt must be a valid Date', 'expiresAt'));
    }
    return ok(new AuthSession(props));
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get refreshToken(): string | undefined {
    return this.props.refreshToken;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get user(): User {
    return this.props.user;
  }

  /**
   * Returns `true` when `now` is at or past `expiresAt`, indicating the token
   * should be refreshed or the user prompted to sign in again.
   */
  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this.props.expiresAt.getTime();
  }
}
