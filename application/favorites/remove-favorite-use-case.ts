import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IFavoritesRepository } from '@domain/favorites/i-favorites-repository';

/**
 * Use case for removing a recipe from user's favorites.
 */
export class RemoveFavoriteUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  execute(userId: string, recipeId: string): Promise<Result<void, Failure>> {
    return this.repo.removeFavorite(userId, recipeId);
  }
}
