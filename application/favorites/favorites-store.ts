import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { UnknownFailure } from '@core/failure';
import type { FavoritesStoreState } from '@application/favorites/favorites-store-state';
import type { ConfigureFavoritesStoreOptions } from '@application/favorites/configure-favorites-store-options';

export type FavoritesStore = UseBoundStore<StoreApi<FavoritesStoreState>>;

export const configureFavoritesStore = (deps: ConfigureFavoritesStoreOptions): FavoritesStore => {
  const { addFavoriteUseCase, removeFavoriteUseCase, savedRecipesStore } = deps;

  return create<FavoritesStoreState>((set) => ({
    isLoading: false,
    error: null,
    addFavorite: async (userId: string, recipeId: string) => {
      try {
        set({ isLoading: true, error: null });
         
        console.log(`[FavoritesStore] addFavorite starting...`, { userId, recipeId });
        const result = await addFavoriteUseCase.execute(userId, recipeId);
        if (!result.ok) {
          const failure = result.failure;
           
          console.error(`[FavoritesStore] addFavorite failed: ${failure.code} - ${failure.message}`);
          set({ isLoading: false, error: failure });
          return;
        }
         
        console.log(`[FavoritesStore] addFavorite API call succeeded, updating store...`);
        const { savedIds, setSavedIds } = savedRecipesStore.getState();
        const next = new Set(savedIds);
        next.add(recipeId);
        setSavedIds(next);
        set({ isLoading: false });
         
        console.log(`[FavoritesStore] addFavorite success: ${recipeId} added`);
      } catch (err) {
         
        console.error('[FavoritesStore] addFavorite threw error:', err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        set({ isLoading: false, error: new UnknownFailure(errorMsg) });
      }
    },
    removeFavorite: async (userId: string, recipeId: string) => {
      try {
        set({ isLoading: true, error: null });
         
        console.log(`[FavoritesStore] removeFavorite starting...`, { userId, recipeId });
        const result = await removeFavoriteUseCase.execute(userId, recipeId);
        if (!result.ok) {
          const failure = result.failure;
           
          console.error(`[FavoritesStore] removeFavorite failed: ${failure.code} - ${failure.message}`);
          set({ isLoading: false, error: failure });
          return;
        }
         
        console.log(`[FavoritesStore] removeFavorite API call succeeded, updating store...`);
        const { savedIds, setSavedIds } = savedRecipesStore.getState();
        const next = new Set(savedIds);
        next.delete(recipeId);
        setSavedIds(next);
        set({ isLoading: false });
         
        console.log(`[FavoritesStore] removeFavorite success: ${recipeId} removed`);
      } catch (err) {
         
        console.error('[FavoritesStore] removeFavorite threw error:', err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        set({ isLoading: false, error: new UnknownFailure(errorMsg) });
      }
    },
    clearError: () => set({ error: null }),
  }));
};
