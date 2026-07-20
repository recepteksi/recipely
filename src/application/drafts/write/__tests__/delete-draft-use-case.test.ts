import { FakeRecipeDraftRepository } from '@application/__fixtures__/fake-recipe-draft-repository';
import { DeleteDraftUseCase } from '@application/drafts/write/delete-draft-use-case';
import { NetworkFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';

describe('DeleteDraftUseCase.execute', () => {
  it('forwards the id to the repository and returns ok', async () => {
    const repo = new FakeRecipeDraftRepository({ deleteDraftResult: ok(undefined) });
    const useCase = new DeleteDraftUseCase(repo);

    const r = await useCase.execute('d1');

    expect(repo.lastDeleteId).toBe('d1');
    expect(r.ok).toBe(true);
  });

  it('forwards a repository failure unchanged', async () => {
    const failure = new NetworkFailure('offline');
    const repo = new FakeRecipeDraftRepository({ deleteDraftResult: fail(failure) });
    const useCase = new DeleteDraftUseCase(repo);

    const r = await useCase.execute('d1');

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
