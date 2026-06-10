import { Entity } from '@core/entity/entity';
import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Email } from '@domain/common/email';

export interface UserProps {
  id: string;
  email: Email;
  displayName: string;
  photoUrl?: string;
  bio?: string;
}

/**
 * Domain entity representing an authenticated application user. Validates that
 * `id` and `displayName` are non-empty before construction.
 */
export class User extends Entity<UserProps> {
  private constructor(props: UserProps) {
    super(props);
  }

  static create(props: UserProps): Result<User, ValidationFailure> {
    if (props.id.trim().length === 0) {
      return fail(new ValidationFailure('User id must be non-empty', 'id'));
    }
    if (props.displayName.trim().length === 0) {
      return fail(new ValidationFailure('User displayName must be non-empty', 'displayName'));
    }
    return ok(new User(props));
  }

  get email(): Email {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get photoUrl(): string | undefined {
    return this.props.photoUrl;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }
}
