import type { GetUserProfileUseCase } from '@application/user-profile/get-user-profile-use-case';

export interface UserProfileStoreDeps {
  getUserProfile: GetUserProfileUseCase;
}
