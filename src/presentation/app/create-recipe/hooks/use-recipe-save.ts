import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { getLocale, t } from '@presentation/i18n';
import { showErrorToast, showToast } from '@presentation/base/feedback/show-toast';
import { failureToastMessage } from '@presentation/base/errors/failure-lookups';
import { ValidationFailure, type Failure } from '@core/failure';
import { buildCreateInput, buildUpdateInput } from '@presentation/app/create-recipe/model/build-recipe-input';
import { mapFieldErrorsToInputs, NO_CREATE_RECIPE_FIELD_ERRORS } from '@presentation/app/create-recipe/model/map-field-errors-to-inputs';
import type { UseRecipeSaveArgs } from '@presentation/app/create-recipe/model/use-recipe-save-args';

/**
 * Handles publishing a new recipe or updating an existing one, including the
 * required-field guards, the per-field validation binding, and the blocking
 * retry dialog for non-validation failures.
 */
export const useRecipeSave = ({
  recipe,
  recipeId,
  isEditMode,
  activeDraftId,
  setFieldErrors,
  setMissingMessage,
}: UseRecipeSaveArgs) => {
  const router = useRouter();
  const { createdRecipesStore, draftsStore } = useStores();
  const createState = createdRecipesStore((s) => s.createState);
  const updateState = createdRecipesStore((s) => s.updateState);

  const [saveError, setSaveError] = useState<{ message: string; mode: 'publish' | 'update' } | null>(null);

  // WHY: a `ValidationFailure` carries a per-field breakdown that binds to inputs
  // (red border + inline message) in addition to a toast; entries with no input
  // still reach the user via a toast. Non-validation failures get a blocking
  // dialog with a retry action so a failed save can never go unnoticed.
  const surfaceSaveFailure = useCallback(
    (failure: Failure, mode: 'publish' | 'update'): void => {
      if (!(failure instanceof ValidationFailure)) {
        setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
        setSaveError({ message: failureToastMessage(failure), mode });
        return;
      }
      showErrorToast(failure);
      const parsed = mapFieldErrorsToInputs(failure.fieldErrors);
      setFieldErrors(parsed);
      if (parsed.unmatched.length > 0) {
        showToast({ severity: 'danger', message: parsed.unmatched.join(' ') });
      }
    },
    [setFieldErrors],
  );

  const hasRequiredText = (): boolean => {
    const cleanIngredients = recipe.ingredients.map((s) => s.trim()).filter((s) => s.length > 0);
    if (recipe.name.trim().length === 0 || cleanIngredients.length === 0) {
      setMissingMessage(t().createRecipe.missing);
      return false;
    }
    return true;
  };

  const handlePublish = useCallback(async (): Promise<void> => {
    if (!hasRequiredText()) return;
    // WHY: the backend create endpoint requires a cover image URL, so a recipe
    // cannot be published without at least one photo.
    if (recipe.media.filter((m) => m.type === 'image').length === 0) {
      setMissingMessage(t().createRecipe.noImage);
      return;
    }
    setMissingMessage(null);
    setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
    await createdRecipesStore.getState().createRecipe(buildCreateInput(recipe, getLocale()));
    const state = createdRecipesStore.getState().createState;
    if (state.status === 'success') {
      createdRecipesStore.getState().resetCreateState();
      createdRecipesStore.getState().clearAiDraft();
      // Best-effort cleanup of the working draft now that it's published.
      await draftsStore.getState().deleteDraft(activeDraftId);
      router.replace('/my-recipes');
      return;
    }
    if (state.status === 'error') {
      surfaceSaveFailure(state.failure, 'publish');
      createdRecipesStore.getState().resetCreateState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, createdRecipesStore, draftsStore, activeDraftId, router, surfaceSaveFailure]);

  const handleUpdate = useCallback(async (): Promise<void> => {
    if (recipeId === undefined || !hasRequiredText()) return;
    setMissingMessage(null);
    setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
    await createdRecipesStore.getState().updateRecipe(recipeId, buildUpdateInput(recipe, getLocale()));
    const state = createdRecipesStore.getState().updateState;
    if (state.status === 'success') {
      createdRecipesStore.getState().resetUpdateState();
      router.back();
      return;
    }
    if (state.status === 'error') {
      surfaceSaveFailure(state.failure, 'update');
      createdRecipesStore.getState().resetUpdateState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, recipeId, createdRecipesStore, router, surfaceSaveFailure]);

  const onSave = useCallback((): void => {
    if (isEditMode) void handleUpdate();
    else void handlePublish();
  }, [isEditMode, handleUpdate, handlePublish]);

  const headerTitle = useMemo(
    () => (isEditMode ? t().createRecipe.editorTitle : t().createRecipe.previewTitle),
    [isEditMode],
  );

  const isSaving = isEditMode ? updateState.status === 'updating' : createState.status === 'creating';
  const saveLabel = isEditMode
    ? updateState.status === 'updating'
      ? t().createRecipe.updating
      : t().createRecipe.updateSave
    : createState.status === 'creating'
      ? t().createRecipe.publishing
      : t().createRecipe.save;

  return {
    onSave,
    isSaving,
    saveLabel,
    headerTitle,
    saveError,
    onConfirmSaveError: () => {
      const mode = saveError?.mode;
      setSaveError(null);
      void (mode === 'update' ? handleUpdate() : handlePublish());
    },
    onCloseSaveError: () => setSaveError(null),
  };
};
