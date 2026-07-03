import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { INotificationRepository } from '@domain/notifications/i-notification-repository';
import type { ListNotificationsInput } from '@application/notifications/list-notifications-input';
import type { ListNotificationsResult } from '@application/notifications/list-notifications-result';

/** Retrieves a paginated list of notifications for the current user. */
export class ListNotificationsUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  execute(input: ListNotificationsInput = {}): Promise<Result<ListNotificationsResult, Failure>> {
    return this.repo.list(input.limit, input.offset);
  }
}
