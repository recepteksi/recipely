import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type {
  IRecipeRepository,
  UpdateRecipeInput,
  CreateRecipeProgressCallback,
} from '@domain/recipes/i-recipe-repository';

export class UpdateRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(
    id: string,
    input: UpdateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>> {
    return this.repo.updateRecipe(id, input, onProgress);
  }
}
