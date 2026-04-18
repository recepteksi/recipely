import { FakeAuthRepository } from '@application/__fixtures__/fake-auth-repository';
import { configureAuthStore } from '@application/auth/auth-store';
import { GetSessionUseCase } from '@application/auth/get-session-use-case';
import { SignInUseCase } from '@application/auth/sign-in-use-case';
import { SignOutUseCase } from '@application/auth/sign-out-use-case';
import { UnauthorizedFailure } from '@core/failure';
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

const makeStore = (repo: FakeAuthRepository) =>
  configureAuthStore({
    signIn: new SignInUseCase(repo),
    signOut: new SignOutUseCase(repo),
    getSession: new GetSessionUseCase(repo),
  });

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
});
