import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { GetRecipeUseCase } from '@application/recipes/get-recipe-use-case';

export type RecipeDetailState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; recipe: Recipe }
  | { status: 'error'; failure: Failure };

export interface RecipeDetailStoreState {
  byId: Record<string, RecipeDetailState>;
  load: (id: string) => Promise<void>;
}

export interface RecipeDetailStoreDeps {
  getRecipe: GetRecipeUseCase;
}

export type RecipeDetailStore = UseBoundStore<StoreApi<RecipeDetailStoreState>>;

export const configureRecipeDetailStore = (deps: RecipeDetailStoreDeps): RecipeDetailStore => {
  return create<RecipeDetailStoreState>((set, get) => ({
    byId: {},
    load: async (id: string) => {
      set({ byId: { ...get().byId, [id]: { status: 'loading' } } });
      const result = await deps.getRecipe.execute(id);
      if (!result.ok) {
        set({
          byId: { ...get().byId, [id]: { status: 'error', failure: result.failure } },
        });
        return;
      }
      set({
        byId: { ...get().byId, [id]: { status: 'loaded', recipe: result.value } },
      });
    },
  }));
};
