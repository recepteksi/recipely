import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type {
  IRecipeDraftRepository,
  PagedDrafts,
} from '@domain/drafts/i-recipe-draft-repository';

export interface ListDraftsInput {
  page: number;
  pageSize: number;
}

/** Lists a page of the authenticated user's recipe drafts. */
export class ListDraftsUseCase {
  constructor(private readonly repo: IRecipeDraftRepository) {}

  execute(input: ListDraftsInput): Promise<Result<PagedDrafts, Failure>> {
    return this.repo.listDrafts(input.page, input.pageSize);
  }
}
