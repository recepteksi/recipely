import { create } from 'zustand';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';
import type { RecipeListStoreState } from '@application/recipes/recipe-list-store-state';
import type { RecipeListStoreDeps } from '@application/recipes/recipe-list-store-deps';
import type { RecipeListStore } from '@application/recipes/recipe-list-store';

export const configureRecipeListStore = (deps: RecipeListStoreDeps): RecipeListStore => {
  return create<RecipeListStoreState>((set, get) => ({
    state: { status: 'idle' },
    // WHY: a filter change while a list is already `loaded` re-fetches in
    // place — the previous `recipes` stay on screen (with `isRefreshing:
    // true`) instead of resetting to a data-less `loading` state, so the
    // header/filter chips a screen renders only in the `loaded` branch
    // don't get unmounted mid-refetch. The very first load from `idle`
    // still transitions to plain `loading` (there's nothing to preserve).
    // A failed refresh keeps showing the stale `recipes` and surfaces the
    // error via `refreshFailure` rather than blanking the screen.
    load: async (filters?: RecipeFilters) => {
      const current = get().state;
      if (current.status === 'loaded') {
        set({ state: { ...current, isRefreshing: true, refreshFailure: undefined } });
      } else {
        set({ state: { status: 'loading' } });
      }
      const result = await deps.listRecipes.execute(filters);
      if (!result.ok) {
        set((s) => ({
          state:
            s.state.status === 'loaded'
              ? { ...s.state, isRefreshing: false, refreshFailure: result.failure }
              : { status: 'error', failure: result.failure },
        }));
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
