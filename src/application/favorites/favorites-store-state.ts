import type { Failure } from '@core/failure';

export interface FavoritesStoreState {
  isLoading: boolean;
  error: Failure | null;
  addFavorite: (userId: string, recipeId: string) => Promise<void>;
  removeFavorite: (userId: string, recipeId: string) => Promise<void>;
  clearError: () => void;
}
