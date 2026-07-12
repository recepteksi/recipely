import type { Failure } from '@core/failure';
import type { Notification } from '@domain/notifications/notification';

export type NotificationsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; items: Notification[]; total: number; unreadCount: number }
  | { status: 'error'; failure: Failure };
