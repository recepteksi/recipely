import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IFavoritesRepository } from '@domain/favorites/i-favorites-repository';

/**
 * Use case for adding a recipe to user's favorites.
 */
export class AddFavoriteUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  execute(userId: string, recipeId: string): Promise<Result<void, Failure>> {
    return this.repo.addFavorite(userId, recipeId);
  }
}
