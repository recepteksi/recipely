import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { INotificationRepository } from '@domain/notifications/i-notification-repository';

/** Marks every notification for the current user as read in a single request. */
export class MarkAllReadUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  execute(): Promise<Result<void, Failure>> {
    return this.repo.markAllRead();
  }
}
