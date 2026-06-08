import { FakeAuthRepository } from '@application/__fixtures__/fake-auth-repository';
import { RequestPasswordResetUseCase } from '@application/auth/request-password-reset-use-case';
import { NetworkFailure } from '@core/failure';
import { fail, ok } from '@core/result/result';

describe('RequestPasswordResetUseCase', () => {
  it('returns ok(undefined) when the repository resolves successfully', async () => {
    const repo = new FakeAuthRepository();
    const useCase = new RequestPasswordResetUseCase(repo);

    const result = await useCase.execute('user@example.com');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeUndefined();
  });

  it('propagates a failure returned by the repository', async () => {
    const failure = new NetworkFailure('no connection');
    const repo = new (class extends FakeAuthRepository {
      override requestPasswordReset(_email: string) {
        return Promise.resolve(fail(failure));
      }
    })();
    const useCase = new RequestPasswordResetUseCase(repo);

    const result = await useCase.execute('user@example.com');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure).toBe(failure);
  });

  it('delegates the email argument to the repository unchanged', async () => {
    const calls: string[] = [];
    const repo = new (class extends FakeAuthRepository {
      override requestPasswordReset(email: string) {
        calls.push(email);
        return Promise.resolve(ok(undefined));
      }
    })();
    const useCase = new RequestPasswordResetUseCase(repo);

    await useCase.execute('reset@example.com');

    expect(calls).toEqual(['reset@example.com']);
  });
});
