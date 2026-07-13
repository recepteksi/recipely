import type { RecipeCommentsState } from '@application/comments/recipe-comments-state';

/** Returns the empty per-recipe comments state used before any load. */
export const defaultRecipeState = (): RecipeCommentsState => ({
  items: [],
  total: 0,
  page: 1,
  isLoading: false,
  isLoadingMore: false,
  isSubmitting: false,
  error: null,
});
