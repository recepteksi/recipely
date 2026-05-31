import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';

/**
 * Routes reachable without an authenticated session. Every other path is gated
 * by {@link useAuthGuard}; auth screens and the index splash live here.
 */
export const PUBLIC_PATHS = new Set<string>([
  '/',
  '/login',
  '/register',
  '/verify-code',
  '/forgot-password',
]);

const isPublicPath = (pathname: string): boolean => PUBLIC_PATHS.has(pathname);

/**
 * Redirects to `/login` whenever the session resolves as unauthenticated (or
 * errored) on a route that requires auth — covers both "never logged in" and
 * "signed out". No-ops while the session is still hydrating (`idle`/`loading`)
 * so a valid session is never bounced on a hard reload / deep link.
 */
export const useAuthGuard = (): void => {
  const { authStore } = useStores();
  const status = authStore((s) => s.state.status);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'unauthenticated' && status !== 'error') return;
    if (isPublicPath(pathname)) return;
    router.replace('/login');
  }, [status, pathname, router]);
};
