// Wire shapes returned by the Recipely backend for notification endpoints.
// Keep in sync with recipely-backend `i-notification-repository.ts`.

export interface NotificationItemDto {
  id: string;
  type: string;
  senderId: string | null;
  senderDisplayName: string | null;
  senderPhotoUrl: string | null;
  recipeId: string | null;
  recipeTitle: string | null;
  message: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponseDto {
  items: NotificationItemDto[];
  total: number;
  unreadCount: number;
}
