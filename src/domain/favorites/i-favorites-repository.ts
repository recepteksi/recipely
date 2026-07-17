import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';

/**
 * Repository interface for favorite/bookmark operations.
 * Defines contract for adding and removing recipes from user's favorites.
 */
export interface IFavoritesRepository {
  /**
   * Add a recipe to the user's favorites.
   * @param userId The ID of the user
   * @param recipeId The ID of the recipe to favorite
   * @returns Result indicating success or failure
   */
  addFavorite(userId: string, recipeId: string): Promise<Result<void, Failure>>;

  /**
   * Remove a recipe from the user's favorites.
   * @param userId The ID of the user
   * @param recipeId The ID of the recipe to unfavorite
   * @returns Result indicating success or failure
   */
  removeFavorite(userId: string, recipeId: string): Promise<Result<void, Failure>>;

  /**
   * Get all favorite recipe IDs for the current user.
   * @returns Set of favorite recipe IDs, or failure if request fails
   */
  getFavoritesIds(): Promise<Result<Set<string>, Failure>>;
}
