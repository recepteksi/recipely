import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { container } from '@core/di/container-instance';
import { registerInfrastructure } from '@infrastructure/di/register';
import { registerApplication } from '@application/di/register';
import { StoresProvider, type Stores } from '@presentation/bootstrap/stores-context';
import { getLocale } from '@presentation/i18n/i18n';

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
  console.log('[Bootstrap] Rendering with stores');
  return <StoresProvider value={stores}>{children}</StoresProvider>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
