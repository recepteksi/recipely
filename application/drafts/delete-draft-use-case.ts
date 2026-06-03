import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IRecipeDraftRepository } from '@domain/drafts/i-recipe-draft-repository';

/** Deletes a recipe draft by its id. */
export class DeleteDraftUseCase {
  constructor(private readonly repo: IRecipeDraftRepository) {}

  execute(id: string): Promise<Result<void, Failure>> {
    return this.repo.deleteDraft(id);
  }
}
