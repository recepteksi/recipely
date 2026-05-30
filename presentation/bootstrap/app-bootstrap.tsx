import '@presentation/bootstrap/crypto-polyfill';
import { type ReactNode, useEffect } from 'react';
import { timerStore } from '@application/timers/timer-store';
import { initNotifications } from '@infrastructure/notifications/notification-service';
import { initFirebase } from '@infrastructure/firebase/firebase-init';
import { recordCrash } from '@infrastructure/firebase/crashlytics-service';
import { container } from '@core/di/container-instance';
import { registerInfrastructure } from '@infrastructure/di/register';
import { registerApplication } from '@application/di/register';
import { StoresProvider, type Stores } from '@presentation/bootstrap/stores-context';
import { useTimerNotificationSync } from '@presentation/base/hooks/use-timer-notification-sync';
import { getLocale, hydrateLocale } from '@presentation/i18n/i18n';

export interface AppBootstrapProps {
  children: ReactNode;
}

// Initialize stores synchronously on module load
const initializeStores = (): Stores => {
  registerInfrastructure(container, { localeProvider: getLocale });
  return registerApplication(container);
};

const stores = initializeStores();

export const AppBootstrap = ({ children }: AppBootstrapProps): React.JSX.Element => {
  useTimerNotificationSync();

  useEffect(() => {
    void hydrateLocale();
    void initFirebase();
    stores.authStore.getState().hydrate().catch((err: unknown) => {
      console.error('[AppBootstrap] hydrate failed:', err);
      recordCrash(err, 'AppBootstrap.authStore.hydrate');
    });
    void initNotifications();
    timerStore.getState().hydrate().catch((err: unknown) => {
      console.error('[AppBootstrap] timer hydrate failed:', err);
      recordCrash(err, 'AppBootstrap.timerStore.hydrate');
    });
  }, []);

  return <StoresProvider value={stores}>{children}</StoresProvider>;
};
