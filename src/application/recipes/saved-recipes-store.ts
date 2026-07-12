import type { StoreApi, UseBoundStore } from 'zustand';
import type { SavedRecipesStoreState } from '@application/recipes/saved-recipes-store-state';

/** Bound Zustand store handle produced by `configureSavedRecipesStore`. */
export type SavedRecipesStore = UseBoundStore<StoreApi<SavedRecipesStoreState>>;
