import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IFavoritesRepository } from '@domain/favorites/i-favorites-repository';

/**
 * Marks a recipe as a favorite for the given user.
 */
export class AddFavoriteUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  execute(userId: string, recipeId: string): Promise<Result<void, Failure>> {
    return this.repo.addFavorite(userId, recipeId);
  }
}
