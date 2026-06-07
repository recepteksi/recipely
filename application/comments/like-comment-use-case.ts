import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';

/** Sends a like for the given comment on behalf of the current user. */
export class LikeCommentUseCase {
  constructor(private readonly comments: ICommentRepository) {}

  execute(recipeId: string, commentId: string): Promise<Result<void, Failure>> {
    return this.comments.like(recipeId, commentId);
  }
}
