import { FakeRecipeDraftRepository } from '@application/__fixtures__/fake-recipe-draft-repository';
import { UpsertDraftUseCase } from '@application/drafts/write/upsert-draft-use-case';
import { ValidationFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type { UpsertDraftInput } from '@domain/drafts/upsert-draft-input';

const input: UpsertDraftInput = {
  id: 'd1',
  prompt: 'spicy ramen',
  snapshot: { name: 'Ramen' },
  chatHistory: [{ role: 'user', content: 'spicier' }],
};

const savedDraft: RecipeDraft = {
  id: 'd1',
  ownerId: 'owner-1',
  prompt: 'spicy ramen',
  snapshot: { name: 'Ramen' },
  chatHistory: [{ role: 'user', content: 'spicier' }],
  createdAt: new Date('2026-05-11T12:00:00.000Z'),
  updatedAt: new Date('2026-05-11T12:00:00.000Z'),
};

describe('UpsertDraftUseCase.execute', () => {
  it('forwards the input to the repository and returns the saved draft', async () => {
    const repo = new FakeRecipeDraftRepository({ upsertDraftResult: ok(savedDraft) });
    const useCase = new UpsertDraftUseCase(repo);

    const r = await useCase.execute(input);

    expect(repo.lastUpsertInput).toBe(input);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(savedDraft);
  });

  it('forwards a repository failure unchanged', async () => {
    const failure = new ValidationFailure('bad input');
    const repo = new FakeRecipeDraftRepository({ upsertDraftResult: fail(failure) });
    const useCase = new UpsertDraftUseCase(repo);

    const r = await useCase.execute(input);

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
