import type { ListNotificationsUseCase } from '@application/notifications/list-notifications-use-case';
import type { MarkAllReadUseCase } from '@application/notifications/mark-all-read-use-case';
import type { MarkOneReadUseCase } from '@application/notifications/mark-one-read-use-case';

export interface NotificationsStoreDeps {
  listNotifications: ListNotificationsUseCase;
  markAllRead: MarkAllReadUseCase;
  markOneRead: MarkOneReadUseCase;
}
