import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type {
  CreateRecipeInput,
  CreateRecipeProgressCallback,
  IRecipeRepository,
} from '@domain/recipes/i-recipe-repository';

export class CreateRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(
    input: CreateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>> {
    return this.repo.createRecipe(input, onProgress);
  }
}
