import { FakeRecipeDraftRepository } from '@application/__fixtures__/fake-recipe-draft-repository';
import { ListDraftsUseCase } from '@application/drafts/list/list-drafts-use-case';
import { UnknownFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';
import type { PagedDrafts } from '@domain/drafts/paged-drafts';

const emptyPage: PagedDrafts = { items: [], total: 0, page: 1, pageSize: 20 };

describe('ListDraftsUseCase.execute', () => {
  it('forwards page and pageSize to the repository and returns its page', async () => {
    const repo = new FakeRecipeDraftRepository({ listDraftsResult: ok(emptyPage) });
    const useCase = new ListDraftsUseCase(repo);

    const r = await useCase.execute({ page: 3, pageSize: 10 });

    expect(repo.lastListCall).toEqual({ page: 3, pageSize: 10 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(emptyPage);
  });

  it('forwards a repository failure unchanged', async () => {
    const failure = new UnknownFailure('boom');
    const repo = new FakeRecipeDraftRepository({ listDraftsResult: fail(failure) });
    const useCase = new ListDraftsUseCase(repo);

    const r = await useCase.execute({ page: 1, pageSize: 20 });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.failure).toBe(failure);
  });
});
