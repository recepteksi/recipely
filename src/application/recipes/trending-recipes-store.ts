import type { StoreApi, UseBoundStore } from 'zustand';
import type { TrendingRecipesStoreState } from '@application/recipes/trending-recipes-store-state';

/** Bound Zustand store handle produced by `configureTrendingRecipesStore`. */
export type TrendingRecipesStore = UseBoundStore<StoreApi<TrendingRecipesStoreState>>;
