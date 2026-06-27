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
  /**
   * App-wide unread badge count, kept fresh independently of whether the full
   * notifications list has been loaded. Polled by `refreshUnread` so the bell
   * badge climbs as new notifications arrive, and cleared by `markAllRead`.
   */
  unreadCount: number;
  load: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

export interface NotificationsStoreDeps {
  listNotifications: ListNotificationsUseCase;
  markAllRead: MarkAllReadUseCase;
}

export type NotificationsStore = UseBoundStore<StoreApi<NotificationsStoreState>>;

/**
 * Owns the in-memory notifications feed for the current session. The store is
 * idle until a screen first calls `load`. `refreshUnread` keeps the badge count
 * current without fetching the whole feed (used by the app-wide poller).
 * `markAllRead` performs an optimistic update; on failure the feed is reloaded
 * so the source of truth always wins.
 */
export const configureNotificationsStore = (
  deps: NotificationsStoreDeps,
): NotificationsStore => {
  return create<NotificationsStoreState>((set, get) => ({
    state: { status: 'idle' },
    unreadCount: 0,
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
        unreadCount: result.value.unreadCount,
      });
    },
    refreshUnread: async () => {
      // Fetch the minimum page — the endpoint returns unreadCount regardless of
      // page size, so we only pay for one item to keep the badge fresh.
      const result = await deps.listNotifications.execute({ limit: 1 });
      if (!result.ok) return;
      set({ unreadCount: result.value.unreadCount });
    },
    markAllRead: async () => {
      const current = get().state;
      if (current.status !== 'loaded') {
        // List not loaded — still clear the badge optimistically and persist.
        set({ unreadCount: 0 });
        const earlyResult = await deps.markAllRead.execute();
        if (!earlyResult.ok) await get().refreshUnread();
        return;
      }
      const optimisticItems = current.items.reduce<Notification[]>((acc, n) => {
        const next = Notification.create({
          id: n.id,
          type: n.type,
          senderId: n.senderId,
          senderDisplayName: n.senderDisplayName,
          senderPhotoUrl: n.senderPhotoUrl,
          recipeId: n.recipeId,
          recipeTitle: n.recipeTitle,
          message: n.message,
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
        unreadCount: 0,
      });
      const result = await deps.markAllRead.execute();
      if (!result.ok) {
        await get().load();
      }
    },
  }));
};
