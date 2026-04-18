import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';

export class GetRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(id: string): Promise<Result<Recipe, Failure>> {
    return this.repo.getRecipe(id);
  }
}
