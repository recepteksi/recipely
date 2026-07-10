import type { StoreApi, UseBoundStore } from 'zustand';
import type { CreatedRecipesStoreState } from '@application/recipes/created-recipes-store-state';

/** Bound Zustand store handle produced by `configureCreatedRecipesStore`. */
export type CreatedRecipesStore = UseBoundStore<StoreApi<CreatedRecipesStoreState>>;
