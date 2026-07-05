/**
 * Unit tests for `ProfileScreen`'s bio display.
 *
 * A beta tester reported that a bio saved via "Edit profile" never appears
 * anywhere on the profile screen. These tests lock in the fix: the bio
 * (sourced from `authStore`'s `session.user.bio`) renders when present, and
 * an inviting empty-state prompt (linking back to Edit profile) renders when
 * the bio is absent/blank — never an empty box.
 *
 * Heavy sibling widgets (`TabBar`, `ProfileSettingsSections`) and native-only
 * hooks (`useAvatarUpload`, `expo-router`) are stubbed so the test stays
 * focused on the identity block this screen renders directly.
 */

import { create } from 'zustand';
import { StoresProvider } from '@presentation/bootstrap/stores-context';
import type { Stores } from '@presentation/bootstrap/stores';
import { renderComponent, textContent } from '@presentation/base/test-support/render-component';
import { ProfileScreen } from '@presentation/screens/profile/profile-screen';
import type { AuthStoreState } from '@application/auth/auth-store-state';
import type { UserProfileStoreState } from '@application/user-profile/user-profile-store-state';
import type { SavedRecipesStoreState } from '@application/recipes/saved-recipes-store-state';
import { AuthSession } from '@domain/auth/auth-session';
import { User } from '@domain/auth/user';
import { Email } from '@domain/common/email';
import { t } from '@presentation/i18n';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));

jest.mock('@presentation/screens/profile/use-avatar-upload', () => ({
  useAvatarUpload: jest.fn(() => ({ pickAndUpload: jest.fn(), isUploading: false })),
}));

jest.mock('@presentation/base/widgets/tab-bar', () => ({
  TabBar: () => null,
}));

jest.mock('@presentation/screens/profile/profile-settings-sections', () => ({
  ProfileSettingsSections: () => null,
}));

/** Unwraps a domain `Result`, throwing in-test if construction unexpectedly fails. */
const unwrap = <T,>(result: { ok: boolean; value?: T }): T => {
  if (!result.ok || result.value === undefined) {
    throw new Error('Test fixture construction failed');
  }
  return result.value;
};

/** Builds a real authenticated `AuthSession` whose user carries the given bio. */
const buildSession = (bio: string | undefined): AuthSession => {
  const email = unwrap(Email.create('cook@example.com'));
  const user = unwrap(User.create({ id: 'user-1', email, displayName: 'Ada Lovelace', bio }));
  return unwrap(
    AuthSession.create({
      id: 'session-1',
      accessToken: 'access-token',
      expiresAt: new Date(Date.now() + 3_600_000),
      user,
    }),
  );
};

/** Builds an authStore whose session user carries the given bio. */
const makeAuthStore = (bio: string | undefined) =>
  create<AuthStoreState>(() => ({
    state: { status: 'authenticated', session: buildSession(bio) },
    signIn: jest.fn(),
    register: jest.fn(),
    verifyRegistration: jest.fn(),
    resendRegistrationCode: jest.fn(),
    signOut: jest.fn(),
    expireSession: jest.fn(),
    hydrate: jest.fn(),
    signInWithGoogle: jest.fn(),
    signInWithApple: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    uploadAvatar: jest.fn(),
    updateProfile: jest.fn(),
  }));

const makeUserProfileStore = () =>
  create<UserProfileStoreState>(() => ({
    state: { status: 'idle' },
    load: jest.fn(),
    reset: jest.fn(),
  }));

const makeSavedRecipesStore = () =>
  create<SavedRecipesStoreState>(() => ({
    savedIds: new Set<string>(),
    isLoading: false,
    error: null,
    has: () => false,
    toggle: jest.fn(),
    addLocal: jest.fn(),
    removeLocal: jest.fn(),
    setSavedIds: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
  }));

const renderProfile = (bio: string | undefined): ReturnType<typeof renderComponent> => {
  const stores = {
    authStore: makeAuthStore(bio),
    userProfileStore: makeUserProfileStore(),
    savedRecipesStore: makeSavedRecipesStore(),
  } as unknown as Stores;

  return renderComponent(
    <StoresProvider value={stores}>
      <ProfileScreen />
    </StoresProvider>,
  );
};

describe('ProfileScreen — bio display', () => {
  it('renders the bio text when the signed-in user has one set', () => {
    const { root } = renderProfile('Home kitchen, small steps.');

    expect(textContent(root)).toContain('Home kitchen, small steps.');
  });

  it('does not show the empty-bio prompt when a bio is present', () => {
    const { root } = renderProfile('Home kitchen, small steps.');

    expect(textContent(root)).not.toContain(t().profile.addBioPrompt);
  });

  it('shows an inviting empty-state prompt instead of blank space when bio is undefined', () => {
    const { root } = renderProfile(undefined);

    expect(textContent(root)).toContain(t().profile.addBioPrompt);
  });

  it('shows the empty-state prompt when bio is a blank/whitespace-only string', () => {
    const { root } = renderProfile('   ');

    expect(textContent(root)).toContain(t().profile.addBioPrompt);
  });
});
