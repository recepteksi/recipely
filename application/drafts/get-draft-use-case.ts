import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type { IRecipeDraftRepository } from '@domain/drafts/i-recipe-draft-repository';

/** Fetches a single recipe draft by its id. */
export class GetDraftUseCase {
  constructor(private readonly repo: IRecipeDraftRepository) {}

  execute(id: string): Promise<Result<RecipeDraft, Failure>> {
    return this.repo.getDraft(id);
  }
}
