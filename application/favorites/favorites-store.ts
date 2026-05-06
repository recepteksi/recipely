import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import type { AddFavoriteUseCase } from '@application/favorites/add-favorite-use-case';
import type { RemoveFavoriteUseCase } from '@application/favorites/remove-favorite-use-case';
import type { SavedRecipesStore } from '@application/recipes/saved-recipes-store';

export interface FavoritesStoreState {
  isLoading: boolean;
  error: Failure | null;
  addFavorite: (userId: string, recipeId: string) => Promise<void>;
  removeFavorite: (userId: string, recipeId: string) => Promise<void>;
  clearError: () => void;
}

export type FavoritesStore = UseBoundStore<StoreApi<FavoritesStoreState>>;

export interface ConfigureFavoritesStoreOptions {
  addFavoriteUseCase: AddFavoriteUseCase;
  removeFavoriteUseCase: RemoveFavoriteUseCase;
  savedRecipesStore: SavedRecipesStore;
}

export const configureFavoritesStore = (deps: ConfigureFavoritesStoreOptions): FavoritesStore => {
  const { addFavoriteUseCase, removeFavoriteUseCase, savedRecipesStore } = deps;

  return create<FavoritesStoreState>((set) => ({
    isLoading: false,
    error: null,
    addFavorite: async (userId: string, recipeId: string) => {
      set({ isLoading: true, error: null });
      const result = await addFavoriteUseCase.execute(userId, recipeId);
      if (!result.ok) {
        const failure = result.failure;
        // eslint-disable-next-line no-console
        console.error(`[FavoritesStore] addFavorite failed: ${failure.code} - ${failure.message}`);
        set({ isLoading: false, error: failure });
        return;
      }
      const setSavedIds = savedRecipesStore((s) => s.setSavedIds);
      const currentIds = savedRecipesStore((s) => s.savedIds);
      const next = new Set(currentIds);
      next.add(recipeId);
      setSavedIds(next);
      set({ isLoading: false });
      // eslint-disable-next-line no-console
      console.log(`[FavoritesStore] addFavorite success: ${recipeId} added`);
    },
    removeFavorite: async (userId: string, recipeId: string) => {
      set({ isLoading: true, error: null });
      const result = await removeFavoriteUseCase.execute(userId, recipeId);
      if (!result.ok) {
        const failure = result.failure;
        // eslint-disable-next-line no-console
        console.error(`[FavoritesStore] removeFavorite failed: ${failure.code} - ${failure.message}`);
        set({ isLoading: false, error: failure });
        return;
      }
      const setSavedIds = savedRecipesStore((s) => s.setSavedIds);
      const currentIds = savedRecipesStore((s) => s.savedIds);
      const next = new Set(currentIds);
      next.delete(recipeId);
      setSavedIds(next);
      set({ isLoading: false });
      // eslint-disable-next-line no-console
      console.log(`[FavoritesStore] removeFavorite success: ${recipeId} removed`);
    },
    clearError: () => set({ error: null }),
  }));
};
