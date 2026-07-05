import type { NotifKind } from '@presentation/screens/notifications/notif-kind';

export interface NotifItem {
  id: string;
  kind: NotifKind;
  actor: string;
  recipeName?: string;
  daysAgo: number;
  read: boolean;
  body?: string;
}
