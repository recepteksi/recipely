import type { Failure } from '@core/failure';
import type { Result } from '@core/result/result';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type { PagedDrafts } from '@domain/drafts/paged-drafts';

export interface FakeRecipeDraftRepositoryConfig {
  listDraftsResult?: Result<PagedDrafts, Failure>;
  getLatestDraftResult?: Result<RecipeDraft | null, Failure>;
  getDraftResult?: Result<RecipeDraft, Failure>;
  upsertDraftResult?: Result<RecipeDraft, Failure>;
  deleteDraftResult?: Result<void, Failure>;
}
