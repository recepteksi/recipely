import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';

export class DeleteRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(id: string): Promise<Result<void, Failure>> {
    return this.repo.deleteRecipe(id);
  }
}
