import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { CreateRecipeUseCase } from '@application/recipes/create-recipe-use-case';
import type { ListMyRecipesUseCase } from '@application/recipes/list-my-recipes-use-case';
import type { GenerateRecipeUseCase } from '@application/recipes/generate-recipe-use-case';
import type { RefineRecipeUseCase } from '@application/recipes/refine-recipe-use-case';
import type { UpdateRecipeUseCase } from '@application/recipes/update-recipe-use-case';
import type { DeleteRecipeUseCase } from '@application/recipes/delete-recipe-use-case';
import type { RecipeListStore } from '@application/recipes/recipe-list-store';
import type { RecipeDetailStore } from '@application/recipes/recipe-detail-store';
import type {
  CreateRecipeInput,
  CreateRecipeProgressCallback,
  UpdateRecipeInput,
} from '@domain/recipes/i-recipe-repository';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';

export type CreateRecipeState =
  | { status: 'idle' }
  | { status: 'creating' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };

export type GenerateRecipeState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };

export type UpdateRecipeState =
  | { status: 'idle' }
  | { status: 'updating' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };

export type DeleteRecipeState =
  | { status: 'idle' }
  | { status: 'deleting' }
  | { status: 'success' }
  | { status: 'error'; failure: Failure };

export type RefineRecipeState =
  | { status: 'idle' }
  | { status: 'refining' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };

export interface CreatedRecipesStoreState {
  recipes: readonly Recipe[];
  createState: CreateRecipeState;
  generateState: GenerateRecipeState;
  updateState: UpdateRecipeState;
  deleteState: DeleteRecipeState;
  refineState: RefineRecipeState;
  aiDraft: Recipe | null;
  add: (recipe: Recipe) => void;
  remove: (id: string) => void;
  replace: (recipe: Recipe) => void;
  findById: (id: string) => Recipe | undefined;
  createRecipe: (input: CreateRecipeInput, onProgress?: CreateRecipeProgressCallback) => Promise<void>;
  loadMyRecipes: () => Promise<void>;
  generateRecipe: (prompt: string, locale: string) => Promise<void>;
  refineRecipe: (
    currentRecipe: DraftRecipeSnapshot,
    instruction: string,
  ) => Promise<Recipe | null>;
  updateRecipe: (id: string, input: UpdateRecipeInput, onProgress?: CreateRecipeProgressCallback) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  resetCreateState: () => void;
  resetGenerateState: () => void;
  resetRefineState: () => void;
  resetUpdateState: () => void;
  resetDeleteState: () => void;
  clearAiDraft: () => void;
}

export interface CreatedRecipesStoreDeps {
  createRecipeUseCase: CreateRecipeUseCase;
  listMyRecipesUseCase: ListMyRecipesUseCase;
  generateRecipeUseCase: GenerateRecipeUseCase;
  refineRecipeUseCase: RefineRecipeUseCase;
  updateRecipeUseCase: UpdateRecipeUseCase;
  deleteRecipeUseCase: DeleteRecipeUseCase;
  // WHY: owner-mutation flows must keep the public feed and detail cache in
  // sync. Without this, the recipe list at /recipes and the detail page show
  // stale data after an edit until the next full reload.
  recipeListStore: RecipeListStore;
  recipeDetailStore: RecipeDetailStore;
}

export type CreatedRecipesStore = UseBoundStore<StoreApi<CreatedRecipesStoreState>>;

export const configureCreatedRecipesStore = (deps: CreatedRecipesStoreDeps): CreatedRecipesStore => {
  return create<CreatedRecipesStoreState>((set, get) => ({
    recipes: [],
    createState: { status: 'idle' },
    generateState: { status: 'idle' },
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
    resetRefineState: () => set({ refineState: { status: 'idle' } }),
    resetUpdateState: () => set({ updateState: { status: 'idle' } }),
    resetDeleteState: () => set({ deleteState: { status: 'idle' } }),
    clearAiDraft: () => set({ aiDraft: null }),
  }));
};
