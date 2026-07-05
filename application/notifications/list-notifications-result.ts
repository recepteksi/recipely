import type { Notification } from '@domain/notifications/notification';

export interface ListNotificationsResult {
  items: Notification[];
  total: number;
  unreadCount: number;
}
