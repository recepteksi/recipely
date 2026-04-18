import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { ListRecipesUseCase } from '@application/recipes/list-recipes-use-case';

export type RecipeListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; recipes: Recipe[] }
  | { status: 'error'; failure: Failure };

export interface RecipeListStoreState {
  state: RecipeListState;
  load: () => Promise<void>;
}

export interface RecipeListStoreDeps {
  listRecipes: ListRecipesUseCase;
}

export type RecipeListStore = UseBoundStore<StoreApi<RecipeListStoreState>>;

export const configureRecipeListStore = (deps: RecipeListStoreDeps): RecipeListStore => {
  return create<RecipeListStoreState>((set) => ({
    state: { status: 'idle' },
    load: async () => {
      set({ state: { status: 'loading' } });
      const result = await deps.listRecipes.execute();
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'loaded', recipes: result.value } });
    },
  }));
};
