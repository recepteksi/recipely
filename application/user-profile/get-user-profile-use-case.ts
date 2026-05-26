import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { UserProfile } from '@domain/user-profile/user-profile';
import type { IUserProfileRepository } from '@domain/user-profile/i-user-profile-repository';

export interface GetUserProfileInput {
  userId: string;
}

/** Fetches the public profile for any user by their ID. */
export class GetUserProfileUseCase {
  constructor(private readonly repo: IUserProfileRepository) {}

  execute(input: GetUserProfileInput): Promise<Result<UserProfile, Failure>> {
    return this.repo.getById(input.userId);
  }
}
