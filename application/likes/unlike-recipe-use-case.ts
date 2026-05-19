import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { ILikeRepository } from '@domain/likes/i-like-repository';

/** Removes the current user's like from the given recipe. */
export class UnlikeRecipeUseCase {
  constructor(private readonly likes: ILikeRepository) {}

  execute(recipeId: string): Promise<Result<void, Failure>> {
    return this.likes.unlike(recipeId);
  }
}
