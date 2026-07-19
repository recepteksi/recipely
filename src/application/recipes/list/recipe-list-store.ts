import type { StoreApi, UseBoundStore } from 'zustand';
import type { RecipeListStoreState } from '@application/recipes/list/recipe-list-store-state';

/** Bound Zustand store handle produced by `configureRecipeListStore`. */
export type RecipeListStore = UseBoundStore<StoreApi<RecipeListStoreState>>;
