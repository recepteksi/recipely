import { ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { Notification } from '@domain/notifications/notification';
import type { INotificationRepository } from '@domain/notifications/i-notification-repository';
import type { NotificationListResult } from '@domain/notifications/notification-list-result';
import type { HttpClient } from '@infrastructure/network/http-client';
import type { NotificationItemDto } from '@infrastructure/notifications/notification-item-dto';
import type { NotificationsResponseDto } from '@infrastructure/notifications/notifications-response-dto';

/**
 * Implements `INotificationRepository` against the Recipely backend. All
 * endpoints live under `/me/` and require a valid JWT session.
 */
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly http: HttpClient) {}

  async list(limit?: number, offset?: number): Promise<Result<NotificationListResult, Failure>> {
    const params: Record<string, number> = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;

    const result = await this.http.request<NotificationsResponseDto>({
      method: 'GET',
      url: '/me/notifications',
      params,
    });
    if (!result.ok) {
      return result;
    }

    const items: Notification[] = [];
    for (const dto of result.value.items) {
      const mapped = mapDtoToNotification(dto);
      if (mapped.ok) {
        items.push(mapped.value);
      }
      // Silently skip items that fail mapping — a single malformed notification
      // should not prevent the rest of the list from rendering.
    }

    return ok({
      items,
      total: result.value.total,
      unreadCount: result.value.unreadCount,
    });
  }

  async markAllRead(): Promise<Result<void, Failure>> {
    const result = await this.http.request<unknown>({
      method: 'POST',
      url: '/me/notifications/read-all',
    });
    if (!result.ok) {
      return result;
    }
    return ok(undefined);
  }

  async markOneRead(id: string): Promise<Result<void, Failure>> {
    const result = await this.http.request<unknown>({
      method: 'POST',
      url: `/me/notifications/${encodeURIComponent(id)}/read`,
    });
    if (!result.ok) {
      return result;
    }
    return ok(undefined);
  }

  async registerDeviceToken(
    token: string,
    platform: 'ios' | 'android' | 'web',
  ): Promise<Result<void, Failure>> {
    const result = await this.http.request<unknown>({
      method: 'POST',
      url: '/me/device-token',
      data: { token, platform },
    });
    if (!result.ok) {
      return result;
    }
    return ok(undefined);
  }
}

function mapDtoToNotification(dto: NotificationItemDto): Result<Notification, Failure> {
  return Notification.create({
    id: dto.id,
    type: dto.type,
    senderId: dto.senderId,
    senderDisplayName: dto.senderDisplayName,
    senderPhotoUrl: dto.senderPhotoUrl,
    recipeId: dto.recipeId,
    recipeTitle: dto.recipeTitle,
    message: dto.message ?? null,
    read: dto.read,
    createdAt: new Date(dto.createdAt),
  });
}
