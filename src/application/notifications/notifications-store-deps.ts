import type { ListNotificationsUseCase } from '@application/notifications/list/list-notifications-use-case';
import type { MarkAllReadUseCase } from '@application/notifications/read/mark-all-read-use-case';
import type { MarkOneReadUseCase } from '@application/notifications/read/mark-one-read-use-case';

export interface NotificationsStoreDeps {
  listNotifications: ListNotificationsUseCase;
  markAllRead: MarkAllReadUseCase;
  markOneRead: MarkOneReadUseCase;
}
