import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeCommentsState } from '@application/comments/recipe-comments-state';

export interface CommentsStoreState {
  byRecipe: Record<string, RecipeCommentsState>;
  load(recipeId: string): Promise<void>;
  loadMore(recipeId: string): Promise<void>;
  addComment(recipeId: string, body: string): Promise<boolean>;
  deleteComment(recipeId: string, commentId: string): Promise<boolean>;
  /**
   * Toggle a comment's like with an optimistic in-place update; rolls back on
   * failure. Returns the `Result` so the caller can surface a toast when the
   * toggle is rejected — the optimistic rollback alone is easy to miss.
   */
  toggleLike(recipeId: string, commentId: string): Promise<Result<void, Failure>>;
  /**
   * Drops every cached per-recipe comment list. Called when the session ends
   * (sign-out, expiry, account deletion) so personal content — e.g. comments the
   * backend just cascade-deleted with the account — cannot linger on screens
   * rendered later in the same app session.
   */
  reset(): void;
}
