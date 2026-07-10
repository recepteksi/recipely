import { create } from 'zustand';
import type { RecipeDetailStoreState } from '@application/recipes/recipe-detail-store-state';
import type { RecipeDetailStoreDeps } from '@application/recipes/recipe-detail-store-deps';
import type { RecipeDetailStore } from '@application/recipes/recipe-detail-store';

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
    // WHY: lets owner-mutation flows patch a cached detail in-place so the
    // detail screen reflects the edit on back-navigation without a re-fetch.
    // Overwrites even error/loading entries — the latest mutation is truth.
    replace: (recipe) =>
      set((s) => ({
        byId: { ...s.byId, [recipe.id]: { status: 'loaded', recipe } },
      })),
    remove: (id) =>
      set((s) => {
        if (s.byId[id] === undefined) return s;
        const next = { ...s.byId };
        delete next[id];
        return { byId: next };
      }),
  }));
};
