import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';
import type { CommentPage } from '@domain/comments/comment-page';

export interface ListCommentsInput {
  recipeId: string;
  page: number;
  pageSize: number;
}

/**
 * Fetches a paginated page of comments for a given recipe.
 */
export class ListCommentsUseCase {
  constructor(private readonly repo: ICommentRepository) {}

  execute(input: ListCommentsInput): Promise<Result<CommentPage, Failure>> {
    return this.repo.listByRecipe(input.recipeId, input.page, input.pageSize);
  }
}
