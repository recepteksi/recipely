import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { container } from '@core/di/container-instance';
import { registerInfrastructure } from '@infrastructure/di/register';
import { registerApplication } from '@application/di/register';
import { StoresProvider, type Stores } from '@presentation/bootstrap/stores-context';

export interface AppBootstrapProps {
  children: ReactNode;
}

export const AppBootstrap = ({ children }: AppBootstrapProps): React.JSX.Element => {
  const registeredRef = useRef<boolean>(false);
  const [stores, setStores] = useState<Stores | null>(null);

  useEffect(() => {
    if (registeredRef.current) {
      return;
    }
    registeredRef.current = true;
    registerInfrastructure(container);
    const created = registerApplication(container);
    setStores(created);
    void created.authStore.getState().hydrate();
  }, []);

  if (stores === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return <StoresProvider value={stores}>{children}</StoresProvider>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
