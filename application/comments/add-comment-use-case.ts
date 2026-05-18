import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Comment } from '@domain/comments/comment';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';

export interface AddCommentInput {
  recipeId: string;
  body: string;
}

/**
 * Posts a new comment body to the specified recipe and returns the created
 * `Comment` entity.
 */
export class AddCommentUseCase {
  constructor(private readonly repo: ICommentRepository) {}

  execute(input: AddCommentInput): Promise<Result<Comment, Failure>> {
    return this.repo.add(input.recipeId, input.body);
  }
}
