import type { Recipe } from '@domain/recipes/recipe';
import type { CreateRecipeInput } from '@domain/recipes/create-recipe-input';
import type { CreateRecipeProgressCallback } from '@domain/recipes/create-recipe-progress-callback';
import type { UpdateRecipeInput } from '@domain/recipes/update-recipe-input';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { CreateRecipeState } from '@application/recipes/create-recipe-state';
import type { GenerateRecipeState } from '@application/recipes/generate-recipe-state';
import type { UpdateRecipeState } from '@application/recipes/update-recipe-state';
import type { DeleteRecipeState } from '@application/recipes/delete-recipe-state';
import type { RefineRecipeState } from '@application/recipes/refine-recipe-state';

export interface CreatedRecipesStoreState {
  recipes: readonly Recipe[];
  createState: CreateRecipeState;
  generateState: GenerateRecipeState;
  // WHY: reuses GenerateRecipeState — the import flow has the identical
  // idle/generating/success/error shape (it produces the same preview Recipe),
  // so a near-duplicate state union would only drift over time.
  importState: GenerateRecipeState;
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
  importInstagram: (url: string, locale: string) => Promise<void>;
  refineRecipe: (
    currentRecipe: DraftRecipeSnapshot,
    instruction: string,
  ) => Promise<Recipe | null>;
  updateRecipe: (id: string, input: UpdateRecipeInput, onProgress?: CreateRecipeProgressCallback) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  resetCreateState: () => void;
  resetGenerateState: () => void;
  resetImportState: () => void;
  resetRefineState: () => void;
  resetUpdateState: () => void;
  resetDeleteState: () => void;
  clearAiDraft: () => void;
}
