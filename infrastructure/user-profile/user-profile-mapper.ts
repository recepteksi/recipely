import { type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { UserProfile } from '@domain/user-profile/user-profile';
import type { UserProfileDto } from '@infrastructure/user-profile/user-profile-dto';

/**
 * Maps a `UserProfileDto` from the API into a domain `UserProfile` entity.
 * The wire `joinedAt` ISO string is parsed into a `Date`; follow-related
 * fields on the DTO are intentionally dropped (not part of the domain model).
 */
export const toUserProfile = (
  dto: UserProfileDto,
): Result<UserProfile, ValidationFailure> =>
  UserProfile.create({
    id: dto.id,
    displayName: dto.displayName,
    bio: dto.bio,
    photoUrl: dto.photoUrl,
    recipeCount: dto.recipeCount,
    totalLikes: dto.totalLikes,
    totalViews: dto.totalViews,
    joinedAt: new Date(dto.joinedAt),
  });
