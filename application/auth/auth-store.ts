import type { StoreApi, UseBoundStore } from 'zustand';
import type { AuthStoreState } from '@application/auth/auth-store-state';

/** Bound Zustand store handle produced by `configureAuthStore`. */
export type AuthStore = UseBoundStore<StoreApi<AuthStoreState>>;
