import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Notification } from '@domain/notifications/notification';
import type { INotificationRepository } from '@domain/notifications/i-notification-repository';

export interface ListNotificationsInput {
  limit?: number;
  offset?: number;
}

export interface ListNotificationsResult {
  items: Notification[];
  total: number;
  unreadCount: number;
}

/** Retrieves a paginated list of notifications for the current user. */
export class ListNotificationsUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  execute(input: ListNotificationsInput = {}): Promise<Result<ListNotificationsResult, Failure>> {
    return this.repo.list(input.limit, input.offset);
  }
}
