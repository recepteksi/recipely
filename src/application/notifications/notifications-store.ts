import type { StoreApi, UseBoundStore } from 'zustand';
import type { NotificationsStoreState } from '@application/notifications/notifications-store-state';

/** Bound Zustand store handle produced by `configureNotificationsStore`. */
export type NotificationsStore = UseBoundStore<StoreApi<NotificationsStoreState>>;
