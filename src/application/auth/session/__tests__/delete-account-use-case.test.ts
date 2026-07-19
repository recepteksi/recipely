import { FakeAuthRepository } from '@application/__fixtures__/fake-auth-repository';
import { DeleteAccountUseCase } from '@application/auth/session/delete-account-use-case';
import { NetworkFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';

describe('DeleteAccountUseCase', () => {
  it('propagates success from the repository', async () => {
    const repo = new FakeAuthRepository({ deleteAccountResult: ok(undefined) });
    const useCase = new DeleteAccountUseCase(repo);

    const r = await useCase.execute();

    expect(r.ok).toBe(true);
  });

  it('propagates failure from the repository', async () => {
    const failure = new NetworkFailure('offline');
    const repo = new FakeAuthRepository({ deleteAccountResult: fail(failure) });
    const useCase = new DeleteAccountUseCase(repo);

    const r = await useCase.execute();

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
