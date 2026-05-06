import { fail, ok, type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { HttpClient } from '@infrastructure/network/http-client';
import type { IFavoritesRepository } from '@domain/favorites/i-favorites-repository';

/**
 * Favorites repository implementation.
 * Calls the backend API to add/remove recipe favorites.
 */
export class FavoritesRepository implements IFavoritesRepository {
  constructor(private readonly http: HttpClient) {}

  async addFavorite(userId: string, recipeId: string): Promise<Result<void, Failure>> {
    const result = await this.http.request({
      method: 'POST',
      url: `/recipes/${encodeURIComponent(recipeId)}/favorite`,
    });

    if (!result.ok) {
      return fail(result.failure);
    }

    return ok(void 0);
  }

  async removeFavorite(userId: string, recipeId: string): Promise<Result<void, Failure>> {
    const result = await this.http.request({
      method: 'DELETE',
      url: `/recipes/${encodeURIComponent(recipeId)}/favorite`,
    });

    if (!result.ok) {
      return fail(result.failure);
    }

    return ok(void 0);
  }
}
