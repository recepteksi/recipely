/**
 * Tests for `IndexRedirect`, the app's launch redirect.
 *
 * Guest-first launch (Apple App Store guideline 5.1.1(v)): once the session
 * resolves the index always sends the user to the browsable recipe list
 * (`/recipes`) — never a login wall — regardless of whether the session is
 * authenticated, unauthenticated, or errored. While the session is still
 * hydrating (`idle`/`loading`) nothing is rendered so a valid session is never
 * bounced on a hard reload / deep link.
 *
 * `Redirect` is replaced by a prop-capturing probe so the test can assert the
 * chosen `href` without driving expo-router's real navigation. Rendered bare
 * (no theme/safe-area providers): the component consumes neither, and the
 * providers' async storage hydration would outlive the test environment.
 */

import { act, create } from 'react-test-renderer';
import { IndexRedirect } from '@presentation/app';

let redirectHref: string | null = null;
let mockStatus: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error' = 'idle';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    redirectHref = href;
    return null;
  },
}));

jest.mock('@presentation/bootstrap/use-stores', () => ({
  useStores: jest.fn(() => ({
    authStore: jest.fn((selector: (state: { state: { status: string } }) => unknown) =>
      selector({ state: { status: mockStatus } }),
    ),
  })),
}));

beforeEach(() => {
  redirectHref = null;
});

describe('IndexRedirect', () => {
  it('renders nothing while the session is still hydrating (idle)', () => {
    mockStatus = 'idle';

    act(() => {
      create(<IndexRedirect />);
    });

    expect(redirectHref).toBeNull();
  });

  it('renders nothing while the session is loading', () => {
    mockStatus = 'loading';

    act(() => {
      create(<IndexRedirect />);
    });

    expect(redirectHref).toBeNull();
  });

  it('redirects an authenticated session to /recipes', () => {
    mockStatus = 'authenticated';

    act(() => {
      create(<IndexRedirect />);
    });

    expect(redirectHref).toBe('/recipes');
  });

  it('redirects an unauthenticated session to /recipes (Apple 5.1.1(v) regression)', () => {
    mockStatus = 'unauthenticated';

    act(() => {
      create(<IndexRedirect />);
    });

    expect(redirectHref).toBe('/recipes');
  });

  it('redirects an errored session to /recipes', () => {
    mockStatus = 'error';

    act(() => {
      create(<IndexRedirect />);
    });

    expect(redirectHref).toBe('/recipes');
  });
});
