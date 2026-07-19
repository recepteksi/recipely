import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { AuthStore } from '@application/auth/auth-store';
import type { NotificationsStore } from '@application/notifications/notifications-store';

// How often to re-poll the unread count while the app is in the foreground.
// Android and web receive FCM pushes, but iOS has no push registration yet —
// this poll is its only freshness source, so it stays reasonably tight. The
// endpoint is called with limit=1, so each tick is a minimal request.
const POLL_INTERVAL_MS = 30_000;

/**
 * Keeps the notification bell badge fresh app-wide: refreshes the unread count
 * on mount, whenever the app returns to the foreground, and on a slow interval.
 * No-ops while the user is signed out so we never poll an unauthenticated API.
 */
export const useUnreadNotificationsSync = (
  notificationsStore: NotificationsStore,
  authStore: AuthStore,
): void => {
  useEffect(() => {
    const tick = (): void => {
      if (authStore.getState().state.status !== 'authenticated') return;
      void notificationsStore.getState().refreshUnread();
    };

    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [notificationsStore, authStore]);
};
