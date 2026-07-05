import type { ListDraftsUseCase } from '@application/drafts/list-drafts-use-case';
import type { GetLatestDraftUseCase } from '@application/drafts/get-latest-draft-use-case';
import type { GetDraftUseCase } from '@application/drafts/get-draft-use-case';
import type { UpsertDraftUseCase } from '@application/drafts/upsert-draft-use-case';
import type { DeleteDraftUseCase } from '@application/drafts/delete-draft-use-case';

export interface DraftsStoreDeps {
  listDraftsUseCase: ListDraftsUseCase;
  getLatestDraftUseCase: GetLatestDraftUseCase;
  getDraftUseCase: GetDraftUseCase;
  upsertDraftUseCase: UpsertDraftUseCase;
  deleteDraftUseCase: DeleteDraftUseCase;
}
