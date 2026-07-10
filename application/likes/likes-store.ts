import type { StoreApi, UseBoundStore } from 'zustand';
import type { LikesStoreState } from '@application/likes/likes-store-state';

/** Bound Zustand store handle produced by `configureLikesStore`. */
export type LikesStore = UseBoundStore<StoreApi<LikesStoreState>>;
