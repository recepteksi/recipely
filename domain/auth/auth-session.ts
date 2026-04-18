import { Entity } from '@core/entity/entity';
import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { User } from '@domain/auth/user';

export interface AuthSessionProps {
  id: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: User;
}

export class AuthSession extends Entity<AuthSessionProps> {
  private constructor(props: AuthSessionProps) {
    super(props);
  }

  static create(props: AuthSessionProps): Result<AuthSession, ValidationFailure> {
    if (props.id.trim().length === 0) {
      return fail(new ValidationFailure('Session id must be non-empty', 'id'));
    }
    if (props.accessToken.trim().length === 0) {
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

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this.props.expiresAt.getTime();
  }
}
