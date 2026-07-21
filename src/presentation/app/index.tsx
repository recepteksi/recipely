import { Redirect } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { RoutePaths } from '@presentation/base/constants';

/**
 * Launch redirect. Guest-first: once the session resolves the app always lands
 * on the browsable recipe list (`/recipes`) — for authenticated, unauthenticated
 * and errored sessions alike — so the app never opens on a login wall (Apple
 * App Store guideline 5.1.1(v)). Account-bound actions still gate to login on
 * tap via {@link useGuestGate}. Renders nothing while the session is still
 * hydrating (`idle`/`loading`) so a valid session is never bounced.
 */
export const IndexRedirect = (): React.JSX.Element | null => {
  const { authStore } = useStores();
  const authState = authStore((s) => s.state);

  if (authState.status === 'idle' || authState.status === 'loading') {
    return null;
  }

  return <Redirect href={RoutePaths.recipes} />;
};

export default IndexRedirect;
