import { FakeAuthRepository } from '@application/__fixtures__/fake-auth-repository';
import { ResetPasswordUseCase } from '@application/auth/reset-password-use-case';
import { NotFoundFailure, ValidationFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';

describe('ResetPasswordUseCase', () => {
  it('returns ok(undefined) when the repository resolves successfully', async () => {
    const repo = new FakeAuthRepository();
    const useCase = new ResetPasswordUseCase(repo);

    const result = await useCase.execute('valid-token', 'newP@ssw0rd');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeUndefined();
  });

  it('propagates a NotFoundFailure when the token is unrecognised', async () => {
    const failure = new NotFoundFailure('reset token not found');
    const repo = new (class extends FakeAuthRepository {
      override resetPassword(_token: string, _newPassword: string) {
        return Promise.resolve(fail(failure));
      }
    })();
    const useCase = new ResetPasswordUseCase(repo);

    const result = await useCase.execute('expired-token', 'newP@ssw0rd');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure).toBe(failure);
  });

  it('propagates a ValidationFailure when the password does not meet requirements', async () => {
    const failure = new ValidationFailure('password too short');
    const repo = new (class extends FakeAuthRepository {
      override resetPassword(_token: string, _newPassword: string) {
        return Promise.resolve(fail(failure));
      }
    })();
    const useCase = new ResetPasswordUseCase(repo);

    const result = await useCase.execute('valid-token', '123');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure).toBe(failure);
  });

  it('delegates the token and newPassword arguments to the repository unchanged', async () => {
    const calls: { token: string; newPassword: string }[] = [];
    const repo = new (class extends FakeAuthRepository {
      override resetPassword(token: string, newPassword: string) {
        calls.push({ token, newPassword });
        return Promise.resolve(ok(undefined));
      }
    })();
    const useCase = new ResetPasswordUseCase(repo);

    await useCase.execute('tok-123', 'superSecret99');

    expect(calls).toEqual([{ token: 'tok-123', newPassword: 'superSecret99' }]);
  });
});
