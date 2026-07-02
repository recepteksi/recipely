import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { CreateRecipeInput } from '@domain/recipes/create-recipe-input';
import type { CreateRecipeProgressCallback } from '@domain/recipes/create-recipe-progress-callback';

/**
 * Creates a new recipe by uploading a cover image and recipe fields as
 * multipart form-data. An optional progress callback reports upload progress.
 */
export class CreateRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(
    input: CreateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>> {
    return this.repo.createRecipe(input, onProgress);
  }
}
