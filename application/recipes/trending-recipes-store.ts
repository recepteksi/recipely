import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { TrendingRecipesStoreState } from '@application/recipes/trending-recipes-store-state';
import type { TrendingRecipesStoreDeps } from '@application/recipes/trending-recipes-store-deps';

export type TrendingRecipesStore = UseBoundStore<StoreApi<TrendingRecipesStoreState>>;

export const configureTrendingRecipesStore = (
  deps: TrendingRecipesStoreDeps,
): TrendingRecipesStore => {
  return create<TrendingRecipesStoreState>((set) => ({
    state: { status: 'idle' },
    load: async (limit?: number) => {
      set({ state: { status: 'loading' } });
      const result = await deps.listTrendingRecipes.execute(limit);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'loaded', recipes: result.value } });
    },
  }));
};
