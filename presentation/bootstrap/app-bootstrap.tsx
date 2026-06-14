import '@presentation/bootstrap/crypto-polyfill';
import { type ReactNode, useEffect } from 'react';
import { timerStore } from '@application/timers/timer-store';
import { initNotifications } from '@infrastructure/notifications/notification-service';
import { initFirebase } from '@infrastructure/firebase/firebase-init';
import { recordCrash } from '@infrastructure/firebase/crashlytics-service';
import { container } from '@core/di/container-instance';
import { TOKENS } from '@core/di/tokens';
import { registerInfrastructure } from '@infrastructure/di/register';
import { registerApplication } from '@application/di/register';
import type { RegisterDeviceTokenUseCase } from '@application/notifications/register-device-token-use-case';
import { StoresProvider, type Stores } from '@presentation/bootstrap/stores-context';
import { useTimerNotificationSync } from '@presentation/base/hooks/use-timer-notification-sync';
import { useUnreadNotificationsSync } from '@presentation/base/hooks/use-unread-notifications-sync';
import { useTaxonomySync } from '@presentation/base/hooks/use-taxonomy-sync';
import { registerPushToken } from '@infrastructure/notifications/push-token-registrar';
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
  useUnreadNotificationsSync(stores.notificationsStore, stores.authStore);
  useTaxonomySync(stores.taxonomyStore, stores.authStore);

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

  // Register the device's push token once the user is authenticated (no-op on
  // native; web registers via the Firebase JS SDK when configured).
  useEffect(() => {
    let registered = false;
    const maybeRegister = (): void => {
      if (registered) return;
      if (stores.authStore.getState().state.status !== 'authenticated') return;
      registered = true;
      const useCase = container.resolve<RegisterDeviceTokenUseCase>(
        TOKENS.RegisterDeviceTokenUseCase,
      );
      void registerPushToken((token, platform) => useCase.execute(token, platform));
    };
    maybeRegister();
    return stores.authStore.subscribe(maybeRegister);
  }, []);

  return <StoresProvider value={stores}>{children}</StoresProvider>;
};
