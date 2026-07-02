import type { Notification } from '@domain/notifications/notification';

export interface NotificationListResult {
  items: Notification[];
  total: number;
  unreadCount: number;
}
