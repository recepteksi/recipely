import type { AddFavoriteUseCase } from '@application/favorites/add-favorite-use-case';
import type { RemoveFavoriteUseCase } from '@application/favorites/remove-favorite-use-case';
import type { SavedRecipesStore } from '@application/recipes/saved-recipes-store';

export interface ConfigureFavoritesStoreOptions {
  addFavoriteUseCase: AddFavoriteUseCase;
  removeFavoriteUseCase: RemoveFavoriteUseCase;
  savedRecipesStore: SavedRecipesStore;
}
