import { fail } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import { type Failure, ValidationFailure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { GenerateRecipeInput } from '@application/recipes/generate-recipe-input';

/**
 * Generates a recipe from a free-text AI prompt. Returns a
 * `ValidationFailure` immediately when the prompt is blank, without hitting
 * the network.
 */
export class GenerateRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(input: GenerateRecipeInput): Promise<Result<Recipe, Failure>> {
    const trimmed = input.prompt.trim();
    if (trimmed.length === 0) {
      return Promise.resolve(fail(new ValidationFailure('createRecipe.aiError')));
    }
    return this.repo.generateRecipe(trimmed);
  }
}
