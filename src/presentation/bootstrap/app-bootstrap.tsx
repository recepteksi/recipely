import '@presentation/bootstrap/crypto-polyfill';
import { type ReactNode, useEffect, useState } from 'react';
import { timerStore } from '@application/timers/timer-store';
import { getNotificationService } from '@application/notifications/get-notification-service';
import { initFirebase } from '@infrastructure/firebase/firebase-init';
import { recordCrash } from '@infrastructure/firebase/crashlytics-service';
import { container } from '@core/di/container-instance';
import { TOKENS } from '@core/di/tokens';
import { registerInfrastructure } from '@infrastructure/di/register';
import { registerApplication } from '@application/di/register';
import type { RegisterDeviceTokenUseCase } from '@application/notifications/register-device-token-use-case';
import { StoresProvider } from '@presentation/bootstrap/stores-context';
import type { Stores } from '@presentation/bootstrap/stores';
import { AppSyncs } from '@presentation/bootstrap/app-syncs';
import { registerPushToken } from '@infrastructure/notifications/push-token-registrar';
import { hydrateLocale } from '@presentation/i18n/i18n';

export interface AppBootstrapProps {
  children: ReactNode;
}

// WHY: infrastructure is registered BEFORE the stores exist, so the HTTP
// client's 401 hook can't reference the auth store directly. This mutable
// handler is read at call-time — once the stores are created we point it at
// `expireSession`, breaking the chicken-and-egg without infra importing
// application.
let onSessionExpired: () => void = () => {};

// Initialize stores synchronously on module load
const initializeStores = (): Stores => {
  registerInfrastructure(container, {
    onUnauthorized: () => onSessionExpired(),
  });
  const created = registerApplication(container);
  onSessionExpired = () => {
    void created.authStore.getState().expireSession();
  };
  return created;
};

const stores = initializeStores();

export const AppBootstrap = ({ children }: AppBootstrapProps): React.JSX.Element | null => {
  // WHY: the app must not issue a single request before the saved language is
  // restored, otherwise the device language leaks into `Accept-Language` and the
  // backend answers (and generates recipes) in the wrong language. Everything
  // that fetches lives under `AppSyncs`/`children`, which mount only once this
  // flips — the device language is a first-render seed, never a request locale.
  const [localeReady, setLocaleReady] = useState(false);

  useEffect(() => {
    hydrateLocale()
      .catch((err: unknown) => {
        console.error('[AppBootstrap] locale hydrate failed:', err);
        recordCrash(err, 'AppBootstrap.hydrateLocale');
      })
      .finally(() => setLocaleReady(true));
    void initFirebase();
    stores.authStore.getState().hydrate().catch((err: unknown) => {
      console.error('[AppBootstrap] hydrate failed:', err);
      recordCrash(err, 'AppBootstrap.authStore.hydrate');
    });
    void getNotificationService().init();
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

  if (!localeReady) return null;

  return (
    <StoresProvider value={stores}>
      <AppSyncs stores={stores}>{children}</AppSyncs>
    </StoresProvider>
  );
};
