import type { StoreApi, UseBoundStore } from 'zustand';
import type { CommentsStoreState } from '@application/comments/comments-store-state';

/** Bound Zustand store handle produced by `configureCommentsStore`. */
export type CommentsStore = UseBoundStore<StoreApi<CommentsStoreState>>;
