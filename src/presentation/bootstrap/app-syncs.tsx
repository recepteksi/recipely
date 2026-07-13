import type { ReactNode } from 'react';
import type { Stores } from '@presentation/bootstrap/stores';
import { useTimerNotificationSync } from '@presentation/base/hooks/use-timer-notification-sync';
import { useUnreadNotificationsSync } from '@presentation/base/hooks/use-unread-notifications-sync';
import { useTaxonomySync } from '@presentation/base/hooks/use-taxonomy-sync';

export interface AppSyncsProps {
  stores: Stores;
  children: ReactNode;
}

/**
 * Hosts the background sync hooks that issue backend requests on mount.
 *
 * WHY it is a separate component: `AppBootstrap` mounts it only once the locale
 * has hydrated, so no request (the taxonomy catalogs in particular) can leave
 * carrying the device language while the user has a different language saved.
 */
export const AppSyncs = ({ stores, children }: AppSyncsProps): React.JSX.Element => {
  useTimerNotificationSync();
  useUnreadNotificationsSync(stores.notificationsStore, stores.authStore);
  useTaxonomySync(stores.taxonomyStore, stores.authStore);

  return <>{children}</>;
};
