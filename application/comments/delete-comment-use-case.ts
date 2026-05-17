import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';

export interface DeleteCommentInput {
  recipeId: string;
  commentId: string;
}

export class DeleteCommentUseCase {
  constructor(private readonly repo: ICommentRepository) {}

  execute(input: DeleteCommentInput): Promise<Result<void, Failure>> {
    return this.repo.remove(input.recipeId, input.commentId);
  }
}
