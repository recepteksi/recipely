import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { CreatedRecipesStoreState } from '@application/recipes/created-recipes-store-state';
import type { CreatedRecipesStoreDeps } from '@application/recipes/created-recipes-store-deps';

export type CreatedRecipesStore = UseBoundStore<StoreApi<CreatedRecipesStoreState>>;

export const configureCreatedRecipesStore = (deps: CreatedRecipesStoreDeps): CreatedRecipesStore => {
  return create<CreatedRecipesStoreState>((set, get) => ({
    recipes: [],
    createState: { status: 'idle' },
    generateState: { status: 'idle' },
    importState: { status: 'idle' },
    updateState: { status: 'idle' },
    deleteState: { status: 'idle' },
    refineState: { status: 'idle' },
    aiDraft: null,
    add: (recipe) => set((s) => ({ recipes: [recipe, ...s.recipes] })),
    remove: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),
    replace: (recipe) =>
      set((s) => ({ recipes: s.recipes.map((r) => (r.id === recipe.id ? recipe : r)) })),
    findById: (id) => get().recipes.find((r) => r.id === id),
    createRecipe: async (input, onProgress) => {
      set({ createState: { status: 'creating' } });
      const result = await deps.createRecipeUseCase.execute(input, onProgress);
      if (!result.ok) {
        set({ createState: { status: 'error', failure: result.failure } });
        return;
      }
      const recipe = result.value;
      set((s) => ({
        createState: { status: 'success', recipe },
        recipes: [recipe, ...s.recipes],
      }));
    },
    loadMyRecipes: async () => {
      const result = await deps.listMyRecipesUseCase.execute();
      if (!result.ok) {
        return;
      }
      set({ recipes: result.value });
    },
    generateRecipe: async (prompt, locale) => {
      set({ generateState: { status: 'generating' } });
      const result = await deps.generateRecipeUseCase.execute({ prompt, locale });
      if (!result.ok) {
        set({ generateState: { status: 'error', failure: result.failure } });
        return;
      }
      const recipe = result.value;
      // WHY: the backend does NOT persist generated recipes — `/recipes/generate`
      // returns a preview with a throwaway id (see backend GenerateRecipeUseCase:
      // "the recipe is NOT persisted; that's the client's choice via POST /recipes").
      // So we surface it only as `aiDraft` to pre-fill the wizard. It must NOT be
      // prepended to `recipes`, otherwise "My Recipes" would show a phantom entry
      // that does not exist on the server until the user publishes it.
      set({
        generateState: { status: 'success', recipe },
        aiDraft: recipe,
      });
    },
    importInstagram: async (url, locale) => {
      set({ importState: { status: 'generating' } });
      const result = await deps.importInstagramRecipeUseCase.execute({ url, locale });
      if (!result.ok) {
        set({ importState: { status: 'error', failure: result.failure } });
        return;
      }
      const recipe = result.value;
      // WHY: the backend does NOT persist imported recipes — `/recipes/import`
      // returns a preview with a throwaway id (same contract as generate). So we
      // surface it only as `aiDraft` to pre-fill the wizard. It must NOT be
      // prepended to `recipes`, otherwise "My Recipes" would show a phantom entry
      // that does not exist on the server until the user publishes it.
      set({
        importState: { status: 'success', recipe },
        aiDraft: recipe,
      });
    },
    refineRecipe: async (currentRecipe, instruction) => {
      set({ refineState: { status: 'refining' } });
      const result = await deps.refineRecipeUseCase.execute({ currentRecipe, instruction });
      if (!result.ok) {
        set({ refineState: { status: 'error', failure: result.failure } });
        return null;
      }
      const recipe = result.value;
      // WHY: refine returns a NOT-persisted preview (same contract as generate).
      // It is surfaced via refineState only and must NOT be prepended to
      // `recipes`, which would create a phantom "My Recipes" entry.
      set({ refineState: { status: 'success', recipe } });
      return recipe;
    },
    updateRecipe: async (id, input, onProgress) => {
      set({ updateState: { status: 'updating' } });
      const result = await deps.updateRecipeUseCase.execute(id, input, onProgress);
      if (!result.ok) {
        set({ updateState: { status: 'error', failure: result.failure } });
        return;
      }
      const recipe = result.value;
      get().replace(recipe);
      // Propagate the edit to sibling caches so every screen sees fresh data.
      deps.recipeListStore.getState().replace(recipe);
      deps.recipeDetailStore.getState().replace(recipe);
      set({ updateState: { status: 'success', recipe } });
    },
    deleteRecipe: async (id) => {
      set({ deleteState: { status: 'deleting' } });
      const result = await deps.deleteRecipeUseCase.execute(id);
      if (!result.ok) {
        set({ deleteState: { status: 'error', failure: result.failure } });
        return;
      }
      get().remove(id);
      deps.recipeListStore.getState().remove(id);
      deps.recipeDetailStore.getState().remove(id);
      set({ deleteState: { status: 'success' } });
    },
    resetCreateState: () => set({ createState: { status: 'idle' } }),
    resetGenerateState: () => set({ generateState: { status: 'idle' } }),
    resetImportState: () => set({ importState: { status: 'idle' } }),
    resetRefineState: () => set({ refineState: { status: 'idle' } }),
    resetUpdateState: () => set({ updateState: { status: 'idle' } }),
    resetDeleteState: () => set({ deleteState: { status: 'idle' } }),
    clearAiDraft: () => set({ aiDraft: null }),
  }));
};
