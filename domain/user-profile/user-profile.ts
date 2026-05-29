import { Entity } from '@core/entity/entity';
import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';

export interface UserProfileProps {
  id: string;
  displayName: string;
  photoUrl: string | null;
  recipeCount: number;
  totalLikes: number;
  totalViews: number;
  joinedAt: Date;
}

/**
 * Domain entity representing a public user profile. Validates that `id`
 * and `displayName` are non-empty before construction.
 */
export class UserProfile extends Entity<UserProfileProps> {
  private constructor(props: UserProfileProps) {
    super(props);
  }

  static create(props: UserProfileProps): Result<UserProfile, ValidationFailure> {
    if (props.id.trim().length === 0) {
      return fail(new ValidationFailure('UserProfile id must be non-empty', 'id'));
    }
    if (props.displayName.trim().length === 0) {
      return fail(new ValidationFailure('UserProfile displayName must be non-empty', 'displayName'));
    }
    return ok(new UserProfile(props));
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get photoUrl(): string | null {
    return this.props.photoUrl;
  }

  get recipeCount(): number {
    return this.props.recipeCount;
  }

  get totalLikes(): number {
    return this.props.totalLikes;
  }

  get totalViews(): number {
    return this.props.totalViews;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }
}
