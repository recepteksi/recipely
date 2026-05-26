import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Notification } from '@domain/notifications/notification';

export interface NotificationListResult {
  items: Notification[];
  total: number;
  unreadCount: number;
}

/** Repository contract for backend notification operations. */
export interface INotificationRepository {
  list(limit?: number, offset?: number): Promise<Result<NotificationListResult, Failure>>;
  markAllRead(): Promise<Result<void, Failure>>;
  markOneRead(id: string): Promise<Result<void, Failure>>;
  registerDeviceToken(
    token: string,
    platform: 'ios' | 'android' | 'web',
  ): Promise<Result<void, Failure>>;
}
