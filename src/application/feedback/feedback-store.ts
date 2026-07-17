import type { StoreApi, UseBoundStore } from 'zustand';
import type { FeedbackStoreState } from '@application/feedback/feedback-store-state';

/** Bound Zustand store handle produced by `configureFeedbackStore`. */
export type FeedbackStore = UseBoundStore<StoreApi<FeedbackStoreState>>;
