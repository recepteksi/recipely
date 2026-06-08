import { useEffect } from 'react';
import { type Href, usePathname, useRouter } from 'expo-router';
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
  '/reset-password',
]);

const isPublicPath = (pathname: string): boolean => PUBLIC_PATHS.has(pathname);

/**
 * Redirects to `/login` whenever the session resolves as unauthenticated (or
 * errored) on a route that requires auth — covers both "never logged in" and
 * "signed out". No-ops while the session is still hydrating (`idle`/`loading`)
 * so a valid session is never bounced on a hard reload / deep link.
 *
 * When bouncing from a gated path worth returning to (i.e. not `/` and not
 * `/login`), a `redirect` query param is appended so that the login screen
 * can send the user straight back after a successful sign-in, e.g.
 * `/login?redirect=%2Frecipes%2F123`.
 */
export const useAuthGuard = (): void => {
  const { authStore } = useStores();
  const status = authStore((s) => s.state.status);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'unauthenticated' && status !== 'error') return;
    if (isPublicPath(pathname)) return;
    // `pathname` is guaranteed non-public here — the isPublicPath early return
    // above already handled `/`, `/login`, and the other public routes — so it
    // is always worth preserving as a post-login redirect target. Cast: the
    // dynamic redirect param can't be statically verified against expo-router's
    // typed-routes union.
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}` as Href);
  }, [status, pathname, router]);
};
