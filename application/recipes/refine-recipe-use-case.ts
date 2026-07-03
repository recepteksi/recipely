import { fail, type Result } from '@core/result/result';
import { type Failure, ValidationFailure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { RefineRecipeInput } from '@application/recipes/refine-recipe-input';

/**
 * Refines an in-progress recipe against a free-text instruction, returning a
 * NOT-persisted preview `Recipe`. Returns a `ValidationFailure` immediately
 * when the instruction is blank, without hitting the network.
 */
export class RefineRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(input: RefineRecipeInput): Promise<Result<Recipe, Failure>> {
    const trimmed = input.instruction.trim();
    if (trimmed.length === 0) {
      return Promise.resolve(fail(new ValidationFailure('createRecipe.aiError')));
    }
    return this.repo.refineRecipe(input.currentRecipe, trimmed);
  }
}
