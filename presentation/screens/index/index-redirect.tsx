import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';

export const IndexRedirect = (): React.JSX.Element => {
  const { authStore } = useStores();
  const authState = authStore((s) => s.state);

  // While auth state is loading/idle, don't redirect yet
  if (authState.status === 'idle' || authState.status === 'loading') {
    return <Redirect href="/login" />;
  }

  // If authenticated, go to recipes list
  if (authState.status === 'authenticated') {
    return <Redirect href="/recipes" />;
  }

  // Otherwise (unauthenticated or error), go to login
  return <Redirect href="/login" />;
};
