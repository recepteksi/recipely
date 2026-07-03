import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Comment } from '@domain/comments/comment';
import type { CommentPage } from '@domain/comments/comment-page';

export interface ICommentRepository {
  listByRecipe(recipeId: string, page: number, pageSize: number): Promise<Result<CommentPage, Failure>>;
  add(recipeId: string, body: string): Promise<Result<Comment, Failure>>;
  remove(recipeId: string, commentId: string): Promise<Result<void, Failure>>;
  like(recipeId: string, commentId: string): Promise<Result<void, Failure>>;
  unlike(recipeId: string, commentId: string): Promise<Result<void, Failure>>;
}
