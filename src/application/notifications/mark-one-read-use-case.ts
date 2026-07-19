import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { INotificationRepository } from '@domain/notifications/i-notification-repository';

/** Marks a single notification as read for the current user. */
export class MarkOneReadUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  execute(id: string): Promise<Result<void, Failure>> {
    return this.repo.markOneRead(id);
  }
}
