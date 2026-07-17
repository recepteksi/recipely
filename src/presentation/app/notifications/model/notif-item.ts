import type { NotifKind } from '@presentation/app/notifications/model/notif-kind';
import type { NotificationTarget } from '@domain/notifications/notification-target';

export interface NotifItem {
  id: string;
  kind: NotifKind;
  actor: string;
  recipeName?: string;
  daysAgo: number;
  read: boolean;
  body?: string;
  /** Where tapping the row navigates; `null` makes the row non-actionable. */
  target: NotificationTarget | null;
}
