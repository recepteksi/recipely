import type { StoreApi, UseBoundStore } from 'zustand';
import type { UserProfileStoreState } from '@application/user-profile/user-profile-store-state';

/** Bound Zustand store handle produced by `configureUserProfileStore`. */
export type UserProfileStore = UseBoundStore<StoreApi<UserProfileStoreState>>;
