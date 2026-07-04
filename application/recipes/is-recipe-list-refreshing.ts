import type { RecipeListState } from '@application/recipes/recipe-list-state';

/**
 * True while a filter/sort change is refetching an already-`loaded` recipe
 * list in the background (`state.isRefreshing`). Screens use this single
 * predicate to drive both the mobile pull-to-refresh spinner and the web
 * inline refresh indicator, so the two surfaces never drift out of sync.
 */
export const isRecipeListRefreshing = (state: RecipeListState): boolean =>
  state.status === 'loaded' && state.isRefreshing === true;
