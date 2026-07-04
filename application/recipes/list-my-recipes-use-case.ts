import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';

/**
 * Fetches the list of recipes created by the currently authenticated user.
 */
export class ListMyRecipesUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(): Promise<Result<RecipeSummary[], Failure>> {
    return this.repo.listMyRecipes();
  }
}
