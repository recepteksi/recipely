import { FakeRecipeDraftRepository } from '@application/__fixtures__/fake-recipe-draft-repository';
import { GetDraftUseCase } from '@application/drafts/read/get-draft-use-case';
import { NotFoundFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';

const makeDraft = (): RecipeDraft => ({
  id: 'd1',
  ownerId: 'owner-1',
  prompt: 'p',
  snapshot: {},
  chatHistory: [],
  createdAt: new Date('2026-05-11T12:00:00.000Z'),
  updatedAt: new Date('2026-05-11T12:00:00.000Z'),
});

describe('GetDraftUseCase.execute', () => {
  it('forwards the id to the repository and returns the draft', async () => {
    const draft = makeDraft();
    const repo = new FakeRecipeDraftRepository({ getDraftResult: ok(draft) });
    const useCase = new GetDraftUseCase(repo);

    const r = await useCase.execute('d1');

    expect(repo.lastGetDraftId).toBe('d1');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(draft);
  });

  it('forwards a repository failure unchanged', async () => {
    const failure = new NotFoundFailure('gone');
    const repo = new FakeRecipeDraftRepository({ getDraftResult: fail(failure) });
    const useCase = new GetDraftUseCase(repo);

    const r = await useCase.execute('missing');

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
