import type { StoreApi, UseBoundStore } from 'zustand';
import type { RecipeDetailStoreState } from '@application/recipes/detail/recipe-detail-store-state';

/** Bound Zustand store handle produced by `configureRecipeDetailStore`. */
export type RecipeDetailStore = UseBoundStore<StoreApi<RecipeDetailStoreState>>;
