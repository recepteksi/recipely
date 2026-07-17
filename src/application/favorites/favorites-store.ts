import type { StoreApi, UseBoundStore } from 'zustand';
import type { FavoritesStoreState } from '@application/favorites/favorites-store-state';

/** Bound Zustand store handle produced by `configureFavoritesStore`. */
export type FavoritesStore = UseBoundStore<StoreApi<FavoritesStoreState>>;
