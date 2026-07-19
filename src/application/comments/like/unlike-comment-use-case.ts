import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';

/** Removes the current user's like from the given comment. */
export class UnlikeCommentUseCase {
  constructor(private readonly comments: ICommentRepository) {}

  execute(recipeId: string, commentId: string): Promise<Result<void, Failure>> {
    return this.comments.unlike(recipeId, commentId);
  }
}
