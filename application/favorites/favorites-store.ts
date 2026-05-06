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
      savedRecipesStore.setState((s) => {
        const next = new Set(s.savedIds);
        next.add(recipeId);
        return { savedIds: next };
      });
      set({ isLoading: false });
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
      savedRecipesStore.setState((s) => {
        const next = new Set(s.savedIds);
        next.delete(recipeId);
        return { savedIds: next };
      });
      set({ isLoading: false });
    },
    clearError: () => set({ error: null }),
  }));
};
