import { fail } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import { ErrorMessageKey, type Failure, ValidationFailure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { RefineRecipeInput } from '@application/recipes/refine-recipe-input';

/**
 * Refines an in-progress recipe against a free-text instruction, returning a
 * NOT-persisted preview `Recipe`. Returns a `ValidationFailure` keyed
 * `errors.ai.refine_instruction_required` immediately when the instruction is
 * blank, without hitting the network — its OWN key, not generate's: with a
 * recipe already on screen the user must be told what to CHANGE, not what to
 * cook.
 */
export class RefineRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(input: RefineRecipeInput): Promise<Result<Recipe, Failure>> {
    const trimmed = input.instruction.trim();
    if (trimmed.length === 0) {
      return Promise.resolve(
        fail(
          new ValidationFailure(
            'Refine instruction is required',
            undefined,
            ErrorMessageKey.refineInstructionRequired,
          ),
        ),
      );
    }
    return this.repo.refineRecipe(input.currentRecipe, trimmed);
  }
}
