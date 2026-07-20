import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IRecipeDraftRepository } from '@domain/drafts/i-recipe-draft-repository';
import type { PagedDrafts } from '@domain/drafts/paged-drafts';
import type { ListDraftsInput } from '@application/drafts/list/list-drafts-input';

/** Lists a page of the authenticated user's recipe drafts. */
export class ListDraftsUseCase {
  constructor(private readonly repo: IRecipeDraftRepository) {}

  execute(input: ListDraftsInput): Promise<Result<PagedDrafts, Failure>> {
    return this.repo.listDrafts(input.page, input.pageSize);
  }
}
