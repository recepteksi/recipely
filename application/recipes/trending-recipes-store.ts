import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { ListTrendingRecipesUseCase } from '@application/recipes/list-trending-recipes-use-case';

export type TrendingRecipesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; recipes: Recipe[] }
  | { status: 'error'; failure: Failure };

export interface TrendingRecipesStoreState {
  state: TrendingRecipesState;
  load: (limit?: number) => Promise<void>;
}

export interface TrendingRecipesStoreDeps {
  listTrendingRecipes: ListTrendingRecipesUseCase;
}

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
