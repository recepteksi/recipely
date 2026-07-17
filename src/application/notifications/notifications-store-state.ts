import type { NotificationsState } from '@application/notifications/notifications-state';

export interface NotificationsStoreState {
  state: NotificationsState;
  /**
   * App-wide unread badge count, kept fresh independently of whether the full
   * notifications list has been loaded. Polled by `refreshUnread` so the bell
   * badge climbs as new notifications arrive, and cleared by `markAllRead`.
   */
  unreadCount: number;
  load: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  markAllRead: () => Promise<void>;
}
