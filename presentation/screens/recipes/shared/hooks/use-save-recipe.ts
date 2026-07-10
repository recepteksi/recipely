import { useCallback } from 'react';
import { useStores } from '@presentation/bootstrap/stores-context';
import { showErrorToast } from '@presentation/base/feedback/show-toast';

export interface UseSaveRecipeResult {
  /** True when the given recipe id is in the signed-in user's saved set. */
  isSaved: (recipeId: string) => boolean;
  /**
   * Toggles the saved (favorite) state for a recipe, mirroring the detail
   * screen wiring: no-op while a request is in flight or when signed out.
   */
  toggleSave: (recipeId: string) => Promise<void>;
}

/**
 * Shared favorites wiring for the web recipe cards and hero card. Reads the
 * saved set from `savedRecipesStore` and drives `favoritesStore` with the
 * authenticated user id, surfacing a rejected save as a toast. Keeps the
 * presentation layer free of any infrastructure dependency.
 */
export const useSaveRecipe = (): UseSaveRecipeResult => {
  const { savedRecipesStore, favoritesStore, authStore } = useStores();
  const savedIds = savedRecipesStore((s) => s.savedIds);
  const authState = authStore((s) => s.state);
  const userId = authState.status === 'authenticated' ? authState.session.user.id : null;

  const isSaved = useCallback((recipeId: string): boolean => savedIds.has(recipeId), [savedIds]);

  const toggleSave = useCallback(
    async (recipeId: string): Promise<void> => {
      const favorites = favoritesStore.getState();
      if (favorites.isLoading || userId === null) return;
      if (savedRecipesStore.getState().savedIds.has(recipeId)) {
        await favorites.removeFavorite(userId, recipeId);
      } else {
        await favorites.addFavorite(userId, recipeId);
      }
      const failure = favoritesStore.getState().error;
      if (failure !== null) {
        showErrorToast(failure);
        favoritesStore.getState().clearError();
      }
    },
    [favoritesStore, savedRecipesStore, userId],
  );

  return { isSaved, toggleSave };
};
