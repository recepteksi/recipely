import { Redirect } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';

export const IndexRedirect = (): React.JSX.Element | null => {
  const { authStore } = useStores();
  const authState = authStore((s) => s.state);

  if (authState.status === 'idle' || authState.status === 'loading') {
    return null;
  }

  if (authState.status === 'authenticated') {
    return <Redirect href="/recipes" />;
  }

  return <Redirect href="/login" />;
};
