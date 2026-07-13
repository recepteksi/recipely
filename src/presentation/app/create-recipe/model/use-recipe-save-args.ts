import type { EditableRecipe } from '@presentation/app/create-recipe/model/editable-recipe';
import type { CreateRecipeFieldErrors } from '@presentation/app/create-recipe/model/create-recipe-field-errors';

export interface UseRecipeSaveArgs {
  recipe: EditableRecipe;
  recipeId: string | undefined;
  isEditMode: boolean;
  activeDraftId: string;
  setFieldErrors: (errors: CreateRecipeFieldErrors) => void;
  setMissingMessage: (message: string | null) => void;
}
