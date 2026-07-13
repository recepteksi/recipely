import type { INotificationService } from '@domain/notifications/i-notification-service';

/**
 * Null-object notification service used only when none is registered in the
 * container (unit tests that exercise timer flows without the composition root).
 * Every method is inert — the real service is always registered before the UI
 * mounts in the app.
 */
export const noopNotificationService: INotificationService = {
  init: async () => {},
  requestPermissions: async () => false,
  scheduleTimerComplete: async () => [],
  cancel: async () => {},
};
