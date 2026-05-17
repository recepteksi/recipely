import { fail, type Result } from '@core/result/result';
import { type Failure, ValidationFailure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';

export interface GenerateRecipeInput {
  prompt: string;
  locale: string;
}

export class GenerateRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(input: GenerateRecipeInput): Promise<Result<Recipe, Failure>> {
    const trimmed = input.prompt.trim();
    if (trimmed.length === 0) {
      return Promise.resolve(fail(new ValidationFailure('createRecipe.aiError')));
    }
    return this.repo.generateRecipe(trimmed, input.locale);
  }
}
