import type { NotificationItemDto } from '@infrastructure/notifications/notification-item-dto';

export interface NotificationsResponseDto {
  items: NotificationItemDto[];
  total: number;
  unreadCount: number;
}
