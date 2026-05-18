import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';

/**
 * Fetches the paginated list of publicly active recipes for the discovery feed.
 */
export class ListRecipesUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(): Promise<Result<Recipe[], Failure>> {
    return this.repo.listActiveRecipes();
  }
}
