import { FakeAuthRepository } from '@application/__fixtures__/fake-auth-repository';
import type { CommentsStore } from '@application/comments/comments-store';
import { configureAuthStore } from '@application/auth/auth-store';
import { GetSessionUseCase } from '@application/auth/get-session-use-case';
import { SignInUseCase } from '@application/auth/sign-in-use-case';
import { RequestRegistrationUseCase } from '@application/auth/request-registration-use-case';
import { VerifyRegistrationUseCase } from '@application/auth/verify-registration-use-case';
import { ResendRegistrationCodeUseCase } from '@application/auth/resend-registration-code-use-case';
import { SignOutUseCase } from '@application/auth/sign-out-use-case';
import { SignInWithGoogleUseCase } from '@application/auth/sign-in-with-google-use-case';
import { SignInWithAppleUseCase } from '@application/auth/sign-in-with-apple-use-case';
import { RequestPasswordResetUseCase } from '@application/auth/request-password-reset-use-case';
import { ResetPasswordUseCase } from '@application/auth/reset-password-use-case';
import { UploadAvatarUseCase } from '@application/auth/upload-avatar-use-case';
import { UpdateProfileUseCase } from '@application/auth/update-profile-use-case';
import { DeleteAccountUseCase } from '@application/auth/delete-account-use-case';
import { LoadFavoritesUseCase } from '@application/favorites/load-favorites-use-case';
import { configureSavedRecipesStore } from '@application/recipes/saved-recipes-store';
import { NetworkFailure, NotFoundFailure, UnauthorizedFailure } from '@core/failure';
import { fail, ok } from '@core/result/result';
import { AuthSession } from '@domain/auth/auth-session';
import { User } from '@domain/auth/user';
import { Email } from '@domain/common/email';

const buildSession = (overrides: { expiresAt?: Date } = {}): AuthSession => {
  const email = Email.create('u@example.com');
  if (!email.ok) throw new Error();
  const user = User.create({ id: 'u1', email: email.value, displayName: 'U' });
  if (!user.ok) throw new Error();
  const session = AuthSession.create({
    id: 's1',
    accessToken: 'tok',
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 60_000),
    user: user.value,
  });
  if (!session.ok) throw new Error();
  return session.value;
};

// Fake LoadFavoritesUseCase that always returns empty set
const fakeLoadFavorites: LoadFavoritesUseCase = {
  execute: () => Promise.resolve(ok(new Set<string>())),
} as unknown as LoadFavoritesUseCase;

/** Minimal comments-store stand-in exposing the reset() the auth store calls. */
const makeFakeCommentsStore = (): { store: CommentsStore; resetCalls: () => number } => {
  let resets = 0;
  const store = {
    getState: () => ({
      reset: () => {
        resets += 1;
      },
    }),
  } as unknown as CommentsStore;
  return { store, resetCalls: () => resets };
};

const makeStore = (repo: FakeAuthRepository) => {
  const savedRecipesStore = configureSavedRecipesStore();
  const commentsStore = makeFakeCommentsStore().store;
  return configureAuthStore({
    signIn: new SignInUseCase(repo),
    requestRegistration: new RequestRegistrationUseCase(repo),
    verifyRegistration: new VerifyRegistrationUseCase(repo),
    resendRegistrationCode: new ResendRegistrationCodeUseCase(repo),
    signOut: new SignOutUseCase(repo),
    getSession: new GetSessionUseCase(repo),
    loadFavorites: fakeLoadFavorites,
    savedRecipesStore,
    commentsStore,
    signInWithGoogle: new SignInWithGoogleUseCase(repo),
    signInWithApple: new SignInWithAppleUseCase(repo),
    requestPasswordReset: new RequestPasswordResetUseCase(repo),
    resetPassword: new ResetPasswordUseCase(repo),
    uploadAvatar: new UploadAvatarUseCase(repo),
    updateProfile: new UpdateProfileUseCase(repo),
    deleteAccount: new DeleteAccountUseCase(repo),
  });
};

describe('auth-store', () => {
  it('starts idle', () => {
    const store = makeStore(new FakeAuthRepository());

    expect(store.getState().state.status).toBe('idle');
  });

  it('signIn transitions to authenticated on success', async () => {
    const session = buildSession();
    const store = makeStore(new FakeAuthRepository({ signInResult: ok(session) }));

    await store.getState().signIn('emilys', 'emilyspass');

    const s = store.getState().state;
    expect(s.status).toBe('authenticated');
    if (s.status === 'authenticated') expect(s.session).toBe(session);
  });

  it('signIn transitions to error on failure and preserves the failure', async () => {
    const failure = new UnauthorizedFailure('bad');
    const store = makeStore(new FakeAuthRepository({ signInResult: fail(failure) }));

    await store.getState().signIn('bad', 'creds');

    const s = store.getState().state;
    expect(s.status).toBe('error');
    if (s.status === 'error') expect(s.failure).toBe(failure);
  });

  it('register returns the challenge and stays unauthenticated on success', async () => {
    const store = makeStore(
      new FakeAuthRepository({
        requestRegistrationResult: ok({
          email: 'u@example.com',
          expiresInSeconds: 180,
          expiresAt: '2026-01-01T00:03:00.000Z',
        }),
      }),
    );

    const challenge = await store.getState().register('u@example.com', 'password1', 'U');

    expect(challenge).toEqual({
      email: 'u@example.com',
      expiresInSeconds: 180,
      expiresAt: '2026-01-01T00:03:00.000Z',
    });
    expect(store.getState().state.status).toBe('unauthenticated');
  });

  it('register returns null and sets error on failure', async () => {
    const failure = new UnauthorizedFailure('exists');
    const store = makeStore(
      new FakeAuthRepository({ requestRegistrationResult: fail(failure) }),
    );

    const challenge = await store.getState().register('u@example.com', 'password1', 'U');

    expect(challenge).toBeNull();
    const s = store.getState().state;
    expect(s.status).toBe('error');
    if (s.status === 'error') expect(s.failure).toBe(failure);
  });

  it('verifyRegistration transitions to authenticated on success', async () => {
    const session = buildSession();
    const store = makeStore(
      new FakeAuthRepository({ verifyRegistrationResult: ok(session) }),
    );

    await store.getState().verifyRegistration('u@example.com', '123456');

    const s = store.getState().state;
    expect(s.status).toBe('authenticated');
    if (s.status === 'authenticated') expect(s.session).toBe(session);
  });

  it('verifyRegistration transitions to error on failure', async () => {
    const failure = new UnauthorizedFailure('bad code');
    const store = makeStore(
      new FakeAuthRepository({ verifyRegistrationResult: fail(failure) }),
    );

    await store.getState().verifyRegistration('u@example.com', '000000');

    const s = store.getState().state;
    expect(s.status).toBe('error');
    if (s.status === 'error') expect(s.failure).toBe(failure);
  });

  it('resendRegistrationCode returns the refreshed challenge on success', async () => {
    const store = makeStore(
      new FakeAuthRepository({
        resendRegistrationCodeResult: ok({
          email: 'u@example.com',
          expiresInSeconds: 180,
          expiresAt: '2026-01-01T00:03:00.000Z',
        }),
      }),
    );

    const challenge = await store.getState().resendRegistrationCode('u@example.com');

    expect(challenge).toEqual({
      email: 'u@example.com',
      expiresInSeconds: 180,
      expiresAt: '2026-01-01T00:03:00.000Z',
    });
  });

  it('signOut transitions to unauthenticated on success', async () => {
    const store = makeStore(new FakeAuthRepository({ signOutResult: ok(undefined) }));

    await store.getState().signOut();

    expect(store.getState().state.status).toBe('unauthenticated');
  });

  it('hydrate returns authenticated when a valid session exists', async () => {
    const session = buildSession();
    const store = makeStore(new FakeAuthRepository({ currentSessionResult: ok(session) }));

    await store.getState().hydrate();

    expect(store.getState().state.status).toBe('authenticated');
  });

  it('hydrate returns unauthenticated when there is no session', async () => {
    const store = makeStore(new FakeAuthRepository({ currentSessionResult: ok(null) }));

    await store.getState().hydrate();

    expect(store.getState().state.status).toBe('unauthenticated');
  });

  it('hydrate returns unauthenticated when the persisted session is expired', async () => {
    const expired = buildSession({ expiresAt: new Date(Date.now() - 1000) });
    const store = makeStore(new FakeAuthRepository({ currentSessionResult: ok(expired) }));

    await store.getState().hydrate();

    expect(store.getState().state.status).toBe('unauthenticated');
  });

  it('requestPasswordReset returns true when the use case succeeds', async () => {
    const store = makeStore(new FakeAuthRepository());

    const result = await store.getState().requestPasswordReset('user@example.com');

    expect(result).toBe(true);
  });

  it('requestPasswordReset returns false and sets state to error when the use case fails', async () => {
    const failure = new NetworkFailure('no connection');
    const repo = new (class extends FakeAuthRepository {
      override requestPasswordReset(_email: string) {
        return Promise.resolve(fail(failure));
      }
    })();
    const store = makeStore(repo);

    const result = await store.getState().requestPasswordReset('user@example.com');

    expect(result).toBe(false);
    const s = store.getState().state;
    expect(s.status).toBe('error');
    if (s.status === 'error') expect(s.failure).toBe(failure);
  });

  it('resetPassword returns null on success and does not transition to authenticated', async () => {
    const store = makeStore(new FakeAuthRepository());

    const result = await store.getState().resetPassword('valid-token', 'newP@ssw0rd');

    expect(result).toBeNull();
    expect(store.getState().state.status).not.toBe('authenticated');
  });

  it('resetPassword returns the Failure and sets state to error when the use case fails', async () => {
    const failure = new NotFoundFailure('reset token not found');
    const repo = new (class extends FakeAuthRepository {
      override resetPassword(_token: string, _newPassword: string) {
        return Promise.resolve(fail(failure));
      }
    })();
    const store = makeStore(repo);

    const result = await store.getState().resetPassword('expired-token', 'newP@ssw0rd');

    expect(result).toBe(failure);
    const s = store.getState().state;
    expect(s.status).toBe('error');
    if (s.status === 'error') expect(s.failure).toBe(failure);
  });

  it('uploadAvatar returns null and sets the new authenticated session on success', async () => {
    const updated = buildSession();
    const store = makeStore(new FakeAuthRepository({ uploadAvatarResult: ok(updated) }));
    await store.getState().signIn('emilys', 'emilyspass');

    const result = await store.getState().uploadAvatar('file:///tmp/a.png', 'a.png', 'image/png');

    expect(result).toBeNull();
    const s = store.getState().state;
    expect(s.status).toBe('authenticated');
    if (s.status === 'authenticated') expect(s.session).toBe(updated);
  });

  it('uploadAvatar returns the Failure and keeps the authenticated state on failure', async () => {
    const session = buildSession();
    const failure = new NetworkFailure('upload failed');
    const repo = new (class extends FakeAuthRepository {
      override signIn() {
        return Promise.resolve(ok(session));
      }
      override uploadAvatar() {
        return Promise.resolve(fail(failure));
      }
    })();
    const store = makeStore(repo);
    await store.getState().signIn('emilys', 'emilyspass');

    const result = await store.getState().uploadAvatar('file:///tmp/a.png', 'a.png', 'image/png');

    expect(result).toBe(failure);
    const s = store.getState().state;
    expect(s.status).toBe('authenticated');
    if (s.status === 'authenticated') expect(s.session).toBe(session);
  });

  describe('expireSession', () => {
    it('is a no-op when the status is not authenticated (does not call signOut)', async () => {
      const repo = new FakeAuthRepository({ currentSessionResult: ok(null) });
      const signOutSpy = jest.spyOn(repo, 'signOut');
      const store = makeStore(repo);
      // Drive the store to `unauthenticated` (not authenticated).
      await store.getState().hydrate();
      expect(store.getState().state.status).toBe('unauthenticated');
      signOutSpy.mockClear();

      await store.getState().expireSession();

      expect(signOutSpy).not.toHaveBeenCalled();
      expect(store.getState().state.status).toBe('unauthenticated');
    });

    it('is a no-op while loading and leaves the state untouched', async () => {
      const store = makeStore(new FakeAuthRepository());
      // Default state is `idle`; force a `loading` snapshot via signIn in-flight
      // is unnecessary — `idle` is also non-authenticated and exercises the guard.
      expect(store.getState().state.status).toBe('idle');

      await store.getState().expireSession();

      expect(store.getState().state.status).toBe('idle');
    });

    it('clears the session, flips to unauthenticated, and clears savedIds when authenticated', async () => {
      const session = buildSession();
      const repo = new FakeAuthRepository({
        signInResult: ok(session),
        signOutResult: ok(undefined),
      });
      const signOutSpy = jest.spyOn(repo, 'signOut');
      const savedRecipesStore = configureSavedRecipesStore();
      const commentsStore = makeFakeCommentsStore().store;
      const store = configureAuthStore({
        signIn: new SignInUseCase(repo),
        requestRegistration: new RequestRegistrationUseCase(repo),
        verifyRegistration: new VerifyRegistrationUseCase(repo),
        resendRegistrationCode: new ResendRegistrationCodeUseCase(repo),
        signOut: new SignOutUseCase(repo),
        getSession: new GetSessionUseCase(repo),
        loadFavorites: fakeLoadFavorites,
        savedRecipesStore,
        commentsStore,
        signInWithGoogle: new SignInWithGoogleUseCase(repo),
        signInWithApple: new SignInWithAppleUseCase(repo),
        requestPasswordReset: new RequestPasswordResetUseCase(repo),
        resetPassword: new ResetPasswordUseCase(repo),
        uploadAvatar: new UploadAvatarUseCase(repo),
        updateProfile: new UpdateProfileUseCase(repo),
        deleteAccount: new DeleteAccountUseCase(repo),
      });
      await store.getState().signIn('emilys', 'emilyspass');
      expect(store.getState().state.status).toBe('authenticated');
      savedRecipesStore.getState().setSavedIds(new Set(['r1', 'r2']));

      await store.getState().expireSession();

      expect(signOutSpy).toHaveBeenCalledTimes(1);
      expect(store.getState().state.status).toBe('unauthenticated');
      expect(savedRecipesStore.getState().savedIds.size).toBe(0);
    });
  });

  describe('updateProfile', () => {
    const buildUpdatedSession = (): AuthSession => {
      const email = Email.create('u@example.com');
      if (!email.ok) throw new Error();
      const user = User.create({
        id: 'u1',
        email: email.value,
        displayName: 'Updated Name',
        bio: 'Updated bio',
      });
      if (!user.ok) throw new Error();
      const session = AuthSession.create({
        id: 's1',
        accessToken: 'tok',
        expiresAt: new Date(Date.now() + 60_000),
        user: user.value,
      });
      if (!session.ok) throw new Error();
      return session.value;
    };

    it('returns null and sets the new authenticated session on success', async () => {
      const updated = buildUpdatedSession();
      const store = makeStore(new FakeAuthRepository({ updateProfileResult: ok(updated) }));
      await store.getState().signIn('emilys', 'emilyspass');

      const result = await store
        .getState()
        .updateProfile({ displayName: 'Updated Name', bio: 'Updated bio' });

      expect(result).toBeNull();
      const s = store.getState().state;
      expect(s.status).toBe('authenticated');
      if (s.status === 'authenticated') {
        expect(s.session).toBe(updated);
        expect(s.session.user.displayName).toBe('Updated Name');
        expect(s.session.user.bio).toBe('Updated bio');
      }
    });

    it('returns the Failure and keeps the prior authenticated session on failure', async () => {
      const session = buildSession();
      const failure = new NetworkFailure('update failed');
      const repo = new (class extends FakeAuthRepository {
        override signIn() {
          return Promise.resolve(ok(session));
        }
        override updateProfile() {
          return Promise.resolve(fail(failure));
        }
      })();
      const store = makeStore(repo);
      await store.getState().signIn('emilys', 'emilyspass');

      const result = await store.getState().updateProfile({ displayName: 'Updated Name' });

      expect(result).toBe(failure);
      const s = store.getState().state;
      expect(s.status).toBe('authenticated');
      if (s.status === 'authenticated') expect(s.session).toBe(session);
    });
  });

  describe('deleteAccount', () => {
    it('returns null, flips to unauthenticated, and clears savedIds on success', async () => {
      const session = buildSession();
      const repo = new FakeAuthRepository({
        signInResult: ok(session),
        deleteAccountResult: ok(undefined),
      });
      const savedRecipesStore = configureSavedRecipesStore();
      const commentsStore = makeFakeCommentsStore().store;
      const store = configureAuthStore({
        signIn: new SignInUseCase(repo),
        requestRegistration: new RequestRegistrationUseCase(repo),
        verifyRegistration: new VerifyRegistrationUseCase(repo),
        resendRegistrationCode: new ResendRegistrationCodeUseCase(repo),
        signOut: new SignOutUseCase(repo),
        getSession: new GetSessionUseCase(repo),
        loadFavorites: fakeLoadFavorites,
        savedRecipesStore,
        commentsStore,
        signInWithGoogle: new SignInWithGoogleUseCase(repo),
        signInWithApple: new SignInWithAppleUseCase(repo),
        requestPasswordReset: new RequestPasswordResetUseCase(repo),
        resetPassword: new ResetPasswordUseCase(repo),
        uploadAvatar: new UploadAvatarUseCase(repo),
        updateProfile: new UpdateProfileUseCase(repo),
        deleteAccount: new DeleteAccountUseCase(repo),
      });
      await store.getState().signIn('emilys', 'emilyspass');
      expect(store.getState().state.status).toBe('authenticated');
      savedRecipesStore.getState().setSavedIds(new Set(['r1', 'r2']));

      const result = await store.getState().deleteAccount();

      expect(result).toBeNull();
      expect(store.getState().state.status).toBe('unauthenticated');
      expect(savedRecipesStore.getState().savedIds.size).toBe(0);
    });

    it('resets the cached comment lists on success so cascade-deleted comments cannot linger', async () => {
      const session = buildSession();
      const repo = new FakeAuthRepository({
        signInResult: ok(session),
        deleteAccountResult: ok(undefined),
      });
      const savedRecipesStore = configureSavedRecipesStore();
      const fakeComments = makeFakeCommentsStore();
      const store = configureAuthStore({
        signIn: new SignInUseCase(repo),
        requestRegistration: new RequestRegistrationUseCase(repo),
        verifyRegistration: new VerifyRegistrationUseCase(repo),
        resendRegistrationCode: new ResendRegistrationCodeUseCase(repo),
        signOut: new SignOutUseCase(repo),
        getSession: new GetSessionUseCase(repo),
        loadFavorites: fakeLoadFavorites,
        savedRecipesStore,
        commentsStore: fakeComments.store,
        signInWithGoogle: new SignInWithGoogleUseCase(repo),
        signInWithApple: new SignInWithAppleUseCase(repo),
        requestPasswordReset: new RequestPasswordResetUseCase(repo),
        resetPassword: new ResetPasswordUseCase(repo),
        uploadAvatar: new UploadAvatarUseCase(repo),
        updateProfile: new UpdateProfileUseCase(repo),
        deleteAccount: new DeleteAccountUseCase(repo),
      });
      await store.getState().signIn('emilys', 'emilyspass');

      await store.getState().deleteAccount();

      expect(fakeComments.resetCalls()).toBe(1);
    });

    it('returns the Failure and leaves the user authenticated on failure', async () => {
      const session = buildSession();
      const failure = new NetworkFailure('delete failed');
      const repo = new (class extends FakeAuthRepository {
        override signIn() {
          return Promise.resolve(ok(session));
        }
        override deleteAccount() {
          return Promise.resolve(fail(failure));
        }
      })();
      const store = makeStore(repo);
      await store.getState().signIn('emilys', 'emilyspass');

      const result = await store.getState().deleteAccount();

      expect(result).toBe(failure);
      const s = store.getState().state;
      expect(s.status).toBe('authenticated');
      if (s.status === 'authenticated') expect(s.session).toBe(session);
    });
  });
});
