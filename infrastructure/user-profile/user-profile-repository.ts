import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { UserProfile } from '@domain/user-profile/user-profile';
import type { IUserProfileRepository } from '@domain/user-profile/i-user-profile-repository';
import type { HttpClient } from '@infrastructure/network/http-client';
import type { UserProfileDto } from '@infrastructure/user-profile/user-profile-dto';

/**
 * Implements `IUserProfileRepository` against the Recipely backend.
 * Fetches public profile data from `GET /users/:id`.
 */
export class UserProfileRepository implements IUserProfileRepository {
  constructor(private readonly http: HttpClient) {}

  async getById(userId: string): Promise<Result<UserProfile, Failure>> {
    const result = await this.http.request<UserProfileDto>({
      method: 'GET',
      url: `/users/${encodeURIComponent(userId)}`,
    });
    if (!result.ok) {
      return result;
    }
    return UserProfile.create({
      id: result.value.id,
      displayName: result.value.displayName,
      photoUrl: result.value.photoUrl,
      recipeCount: result.value.recipeCount,
      totalLikes: result.value.totalLikes,
      totalViews: result.value.totalViews,
      joinedAt: new Date(result.value.joinedAt),
    });
  }
}
