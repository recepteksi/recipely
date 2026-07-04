import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';

/**
 * Fetches the paginated list of publicly active recipes for the discovery feed.
 * Optional filters are forwarded to the backend as query params.
 */
export class ListRecipesUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(filters?: RecipeFilters): Promise<Result<RecipeSummary[], Failure>> {
    return this.repo.listActiveRecipes(filters);
  }
}
