import { FakeRecipeDraftRepository } from '@application/__fixtures__/fake-recipe-draft-repository';
import { GetLatestDraftUseCase } from '@application/drafts/read/get-latest-draft-use-case';
import { UnknownFailure } from '@core/failure';
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

describe('GetLatestDraftUseCase.execute', () => {
  it('returns the latest draft from the repository', async () => {
    const draft = makeDraft();
    const repo = new FakeRecipeDraftRepository({ getLatestDraftResult: ok(draft) });
    const useCase = new GetLatestDraftUseCase(repo);

    const r = await useCase.execute();

    expect(repo.getLatestCallCount).toBe(1);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(draft);
  });

  it('returns ok(null) when the user has no draft', async () => {
    const repo = new FakeRecipeDraftRepository({ getLatestDraftResult: ok(null) });
    const useCase = new GetLatestDraftUseCase(repo);

    const r = await useCase.execute();

    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });

  it('forwards a repository failure unchanged', async () => {
    const failure = new UnknownFailure('boom');
    const repo = new FakeRecipeDraftRepository({ getLatestDraftResult: fail(failure) });
    const useCase = new GetLatestDraftUseCase(repo);

    const r = await useCase.execute();

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
