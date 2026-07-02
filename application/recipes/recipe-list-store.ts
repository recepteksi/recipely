import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';
import type { ListRecipesUseCase } from '@application/recipes/list-recipes-use-case';

export type RecipeListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; recipes: Recipe[] }
  | { status: 'error'; failure: Failure };

export interface RecipeListStoreState {
  state: RecipeListState;
  load: (filters?: RecipeFilters) => Promise<void>;
  replace: (recipe: Recipe) => void;
  remove: (id: string) => void;
}

export interface RecipeListStoreDeps {
  listRecipes: ListRecipesUseCase;
}

export type RecipeListStore = UseBoundStore<StoreApi<RecipeListStoreState>>;

export const configureRecipeListStore = (deps: RecipeListStoreDeps): RecipeListStore => {
  return create<RecipeListStoreState>((set) => ({
    state: { status: 'idle' },
    load: async (filters?: RecipeFilters) => {
      set({ state: { status: 'loading' } });
      const result = await deps.listRecipes.execute(filters);
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({ state: { status: 'loaded', recipes: result.value } });
    },
    // WHY: lets owner-mutation flows (update/delete via createdRecipesStore)
    // patch the public feed in-place so screens watching this store reflect
    // the edit without a full re-fetch. No-ops if the recipe isn't in the
    // currently loaded page — re-fetch will surface it when the user reaches it.
    replace: (recipe) =>
      set((s) => {
        if (s.state.status !== 'loaded') return s;
        return {
          state: {
            ...s.state,
            recipes: s.state.recipes.map((r) => (r.id === recipe.id ? recipe : r)),
          },
        };
      }),
    remove: (id) =>
      set((s) => {
        if (s.state.status !== 'loaded') return s;
        return {
          state: {
            ...s.state,
            recipes: s.state.recipes.filter((r) => r.id !== id),
          },
        };
      }),
  }));
};
