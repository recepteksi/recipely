import type { TrendingRecipesState } from '@application/recipes/trending-recipes-state';

export interface TrendingRecipesStoreState {
  state: TrendingRecipesState;
  load: (limit?: number) => Promise<void>;
}
