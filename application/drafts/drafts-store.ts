import type { StoreApi, UseBoundStore } from 'zustand';
import type { DraftsStoreState } from '@application/drafts/drafts-store-state';

/** Bound Zustand store handle produced by `configureDraftsStore`. */
export type DraftsStore = UseBoundStore<StoreApi<DraftsStoreState>>;
