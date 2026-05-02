import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { CreateRecipeUseCase } from '@application/recipes/create-recipe-use-case';
import type { CreateRecipeInput, CreateRecipeProgressCallback } from '@domain/recipes/i-recipe-repository';

export type CreateRecipeState =
  | { status: 'idle' }
  | { status: 'creating' }
  | { status: 'success'; recipe: Recipe }
  | { status: 'error'; failure: Failure };

export interface CreatedRecipesStoreState {
  recipes: readonly Recipe[];
  createState: CreateRecipeState;
  add: (recipe: Recipe) => void;
  remove: (id: string) => void;
  findById: (id: string) => Recipe | undefined;
  createRecipe: (input: CreateRecipeInput, onProgress?: CreateRecipeProgressCallback) => Promise<void>;
  resetCreateState: () => void;
}

export interface CreatedRecipesStoreDeps {
  createRecipeUseCase: CreateRecipeUseCase;
}

export type CreatedRecipesStore = UseBoundStore<StoreApi<CreatedRecipesStoreState>>;

export const configureCreatedRecipesStore = (deps: CreatedRecipesStoreDeps): CreatedRecipesStore => {
  return create<CreatedRecipesStoreState>((set, get) => ({
    recipes: [],
    createState: { status: 'idle' },
    add: (recipe) => set((s) => ({ recipes: [recipe, ...s.recipes] })),
    remove: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),
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
    resetCreateState: () => set({ createState: { status: 'idle' } }),
  }));
};
