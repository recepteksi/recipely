import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { UserProfile } from '@domain/user-profile/user-profile';

/** Repository contract for fetching public user profiles. */
export interface IUserProfileRepository {
  getById(userId: string): Promise<Result<UserProfile, Failure>>;
}
