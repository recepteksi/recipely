import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { INotificationRepository } from '@domain/notifications/i-notification-repository';

export type DevicePlatform = 'ios' | 'android' | 'web';

/**
 * Registers the current device's push token with the backend so it can receive
 * FCM notifications. Safe to call repeatedly — the backend upserts by token.
 */
export class RegisterDeviceTokenUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  execute(token: string, platform: DevicePlatform): Promise<Result<void, Failure>> {
    return this.repo.registerDeviceToken(token, platform);
  }
}
