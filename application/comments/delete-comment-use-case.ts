import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';
import type { DeleteCommentInput } from '@application/comments/delete-comment-input';

/**
 * Removes a comment from a recipe, scoped by both `recipeId` and `commentId`
 * to match the backend's nested-resource URL scheme.
 */
export class DeleteCommentUseCase {
  constructor(private readonly repo: ICommentRepository) {}

  execute(input: DeleteCommentInput): Promise<Result<void, Failure>> {
    return this.repo.remove(input.recipeId, input.commentId);
  }
}
