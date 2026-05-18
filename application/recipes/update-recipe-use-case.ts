import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type {
  IRecipeRepository,
  UpdateRecipeInput,
  CreateRecipeProgressCallback,
} from '@domain/recipes/i-recipe-repository';

/**
 * Updates an existing recipe by its `id`. When a new `imageUri` is supplied
 * the image is uploaded separately before patching the recipe fields.
 */
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
