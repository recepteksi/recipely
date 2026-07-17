import type { Failure } from '@core/failure';
import type { Comment } from '@domain/comments/comment';

export interface RecipeCommentsState {
  items: Comment[];
  total: number;
  page: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  error: Failure | null;
}
