import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type { IRecipeDraftRepository } from '@domain/drafts/i-recipe-draft-repository';
import type { UpsertDraftInput } from '@domain/drafts/upsert-draft-input';

/**
 * Creates or updates a draft. The caller supplies the `id` (a client-generated
 * UUID) so a single operation covers both create and update.
 */
export class UpsertDraftUseCase {
  constructor(private readonly repo: IRecipeDraftRepository) {}

  execute(input: UpsertDraftInput): Promise<Result<RecipeDraft, Failure>> {
    return this.repo.upsertDraft(input);
  }
}
