import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Failure } from '@core/failure';
import { Notification } from '@domain/notifications/notification';
import type { ListNotificationsUseCase } from '@application/notifications/list-notifications-use-case';
import type { MarkAllReadUseCase } from '@application/notifications/mark-all-read-use-case';

export type NotificationsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; items: Notification[]; total: number; unreadCount: number }
  | { status: 'error'; failure: Failure };

export interface NotificationsStoreState {
  state: NotificationsState;
  load: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

export interface NotificationsStoreDeps {
  listNotifications: ListNotificationsUseCase;
  markAllRead: MarkAllReadUseCase;
}

export type NotificationsStore = UseBoundStore<StoreApi<NotificationsStoreState>>;

/**
 * Owns the in-memory notifications feed for the current session. The store is
 * idle until a screen first calls `load`. `markAllRead` performs an optimistic
 * update; on failure the feed is reloaded so the source of truth always wins.
 */
export const configureNotificationsStore = (
  deps: NotificationsStoreDeps,
): NotificationsStore => {
  return create<NotificationsStoreState>((set, get) => ({
    state: { status: 'idle' },
    load: async () => {
      set({ state: { status: 'loading' } });
      const result = await deps.listNotifications.execute();
      if (!result.ok) {
        set({ state: { status: 'error', failure: result.failure } });
        return;
      }
      set({
        state: {
          status: 'loaded',
          items: result.value.items,
          total: result.value.total,
          unreadCount: result.value.unreadCount,
        },
      });
    },
    markAllRead: async () => {
      const current = get().state;
      if (current.status !== 'loaded') return;
      const optimisticItems = current.items.reduce<Notification[]>((acc, n) => {
        const next = Notification.create({
          id: n.id,
          type: n.type,
          senderId: n.senderId,
          senderDisplayName: n.senderDisplayName,
          senderPhotoUrl: n.senderPhotoUrl,
          recipeId: n.recipeId,
          recipeTitle: n.recipeTitle,
          read: true,
          createdAt: n.createdAt,
        });
        if (next.ok) acc.push(next.value);
        return acc;
      }, []);
      set({
        state: {
          ...current,
          items: optimisticItems,
          unreadCount: 0,
        },
      });
      const result = await deps.markAllRead.execute();
      if (!result.ok) {
        await get().load();
      }
    },
  }));
};
