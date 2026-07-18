import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { getLocale, t } from '@presentation/i18n';
import { failureToastMessage } from '@presentation/base/errors/failure-lookups';
import { ValidationFailure, type Failure } from '@core/failure';
import { buildCreateInput, buildUpdateInput } from '@presentation/app/create-recipe/model/build-recipe-input';
import { mapFieldErrorsToInputs, NO_CREATE_RECIPE_FIELD_ERRORS } from '@presentation/app/create-recipe/model/map-field-errors-to-inputs';
import type { CreateRecipeFieldErrors } from '@presentation/app/create-recipe/model/create-recipe-field-errors';
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
  const [saveSuccess, setSaveSuccess] = useState<
    { mode: 'publish'; recipeId: string } | { mode: 'update' } | null
  >(null);

  // WHY: a `ValidationFailure` carries a per-field breakdown that binds to inputs
  // (red border + inline message) and, at the form level, a banner pinned above
  // the editor — unmatched entries are appended there so nothing is dropped.
  // Non-validation failures get a blocking dialog with a retry action so a
  // failed save can never go unnoticed.
  const surfaceSaveFailure = useCallback(
    (failure: Failure, mode: 'publish' | 'update'): void => {
      if (!(failure instanceof ValidationFailure)) {
        setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
        setSaveError({ message: failureToastMessage(failure), mode });
        return;
      }
      const parsed = mapFieldErrorsToInputs(failure.fieldErrors);
      setFieldErrors(parsed);
      const banner =
        parsed.unmatched.length > 0
          ? `${failureToastMessage(failure)} ${parsed.unmatched.join(' ')}`
          : failureToastMessage(failure);
      setMissingMessage(banner);
    },
    [setFieldErrors, setMissingMessage],
  );

  // Clears the form-level banner and every inline field error at the start of a
  // save attempt so a prior rejection doesn't linger over a fresh submission.
  const clearSaveFeedback = (): void => {
    setMissingMessage(null);
    setFieldErrors(NO_CREATE_RECIPE_FIELD_ERRORS);
  };

  const hasRequiredText = (): boolean => {
    const nameEmpty = recipe.name.trim().length === 0;
    const ingredientsEmpty = recipe.ingredients.every((s) => s.trim().length === 0);
    if (nameEmpty || ingredientsEmpty) {
      const fields: CreateRecipeFieldErrors['fields'] = {};
      if (nameEmpty) fields.name = t().createRecipe.nameRequired;
      if (ingredientsEmpty) fields.ingredients = t().createRecipe.ingredientsRequired;
      setFieldErrors({ fields, unmatched: [] });
      setMissingMessage(t().createRecipe.missing);
      return false;
    }
    return true;
  };

  const handlePublish = useCallback(async (): Promise<void> => {
    clearSaveFeedback();
    if (!hasRequiredText()) return;
    // WHY: the backend create endpoint requires a cover image URL, so a recipe
    // cannot be published without at least one photo.
    if (recipe.media.filter((m) => m.type === 'image').length === 0) {
      setMissingMessage(t().createRecipe.noImage);
      return;
    }
    await createdRecipesStore.getState().createRecipe(buildCreateInput(recipe, getLocale()));
    const state = createdRecipesStore.getState().createState;
    if (state.status === 'success') {
      // Capture the new recipe's id before the store state is reset so the
      // success dialog can deep-link straight to its detail page.
      const newRecipeId = state.recipe.id;
      createdRecipesStore.getState().resetCreateState();
      createdRecipesStore.getState().clearAiDraft();
      // Best-effort cleanup of the working draft now that it's published.
      await draftsStore.getState().deleteDraft(activeDraftId);
      setSaveSuccess({ mode: 'publish', recipeId: newRecipeId });
      return;
    }
    if (state.status === 'error') {
      surfaceSaveFailure(state.failure, 'publish');
      createdRecipesStore.getState().resetCreateState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, createdRecipesStore, draftsStore, activeDraftId, surfaceSaveFailure]);

  const handleUpdate = useCallback(async (): Promise<void> => {
    if (recipeId === undefined) return;
    clearSaveFeedback();
    if (!hasRequiredText()) return;
    await createdRecipesStore.getState().updateRecipe(recipeId, buildUpdateInput(recipe, getLocale()));
    const state = createdRecipesStore.getState().updateState;
    if (state.status === 'success') {
      createdRecipesStore.getState().resetUpdateState();
      setSaveSuccess({ mode: 'update' });
      return;
    }
    if (state.status === 'error') {
      surfaceSaveFailure(state.failure, 'update');
      createdRecipesStore.getState().resetUpdateState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, recipeId, createdRecipesStore, surfaceSaveFailure]);

  const onSave = useCallback((): void => {
    if (isEditMode) void handleUpdate();
    else void handlePublish();
  }, [isEditMode, handleUpdate, handlePublish]);

  // Primary action: publish → open the new recipe; update → return to the editor's caller.
  const onSuccessPrimary = useCallback((): void => {
    const success = saveSuccess;
    setSaveSuccess(null);
    if (success?.mode === 'publish') {
      router.replace({ pathname: '/recipes/[recipeId]', params: { recipeId: success.recipeId } });
    } else {
      router.back();
    }
  }, [saveSuccess, router]);

  // Dismiss / secondary "Done": publish → My Recipes; update → back. Also the backdrop close.
  const onCloseSuccess = useCallback((): void => {
    const mode = saveSuccess?.mode;
    setSaveSuccess(null);
    if (mode === 'publish') router.replace('/my-recipes');
    else router.back();
  }, [saveSuccess, router]);

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
    saveSuccess,
    onSuccessPrimary,
    onCloseSuccess,
  };
};
