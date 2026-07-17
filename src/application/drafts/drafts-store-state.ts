import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type { DraftsListState } from '@application/drafts/drafts-list-state';
import type { UpsertDraftStoreInput } from '@application/drafts/upsert-draft-store-input';

export interface DraftsStoreState {
  drafts: readonly RecipeDraft[];
  listState: DraftsListState;
  latestDraft: RecipeDraft | null;
  loadDrafts: () => Promise<void>;
  loadLatestDraft: () => Promise<void>;
  upsertDraft: (input: UpsertDraftStoreInput) => Promise<RecipeDraft | null>;
  deleteDraft: (id: string) => Promise<Result<void, Failure>>;
  getDraft: (id: string) => Promise<RecipeDraft | null>;
}
