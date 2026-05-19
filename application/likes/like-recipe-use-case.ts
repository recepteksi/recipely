import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { ILikeRepository } from '@domain/likes/i-like-repository';

/** Sends a like for the given recipe on behalf of the current user. */
export class LikeRecipeUseCase {
  constructor(private readonly likes: ILikeRepository) {}

  execute(recipeId: string): Promise<Result<void, Failure>> {
    return this.likes.like(recipeId);
  }
}
