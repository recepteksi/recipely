import { type Failure, UnknownFailure } from '@core/failure';
import { fail, ok, type Result } from '@core/result/result';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type {
  IRecipeDraftRepository,
  PagedDrafts,
  UpsertDraftInput,
} from '@domain/drafts/i-recipe-draft-repository';

export interface FakeRecipeDraftRepositoryConfig {
  listDraftsResult?: Result<PagedDrafts, Failure>;
  getLatestDraftResult?: Result<RecipeDraft | null, Failure>;
  getDraftResult?: Result<RecipeDraft, Failure>;
  upsertDraftResult?: Result<RecipeDraft, Failure>;
  deleteDraftResult?: Result<void, Failure>;
}

export interface ListDraftsCall {
  page: number;
  pageSize: number;
}

/**
 * In-memory test double for `IRecipeDraftRepository`. Returns pre-configured
 * `Result` values and records call arguments / counts so tests can assert on
 * invocation details without a spy framework.
 */
export class FakeRecipeDraftRepository implements IRecipeDraftRepository {
  lastListCall: ListDraftsCall | null = null;
  listCallCount = 0;
  getLatestCallCount = 0;
  lastGetDraftId: string | null = null;
  getDraftCallCount = 0;
  lastUpsertInput: UpsertDraftInput | null = null;
  upsertCallCount = 0;
  lastDeleteId: string | null = null;
  deleteCallCount = 0;

  constructor(private readonly config: FakeRecipeDraftRepositoryConfig = {}) {}

  listDrafts(page: number, pageSize: number): Promise<Result<PagedDrafts, Failure>> {
    this.lastListCall = { page, pageSize };
    this.listCallCount += 1;
    return Promise.resolve(
      this.config.listDraftsResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  getLatestDraft(): Promise<Result<RecipeDraft | null, Failure>> {
    this.getLatestCallCount += 1;
    return Promise.resolve(this.config.getLatestDraftResult ?? ok(null));
  }

  getDraft(id: string): Promise<Result<RecipeDraft, Failure>> {
    this.lastGetDraftId = id;
    this.getDraftCallCount += 1;
    return Promise.resolve(
      this.config.getDraftResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  upsertDraft(input: UpsertDraftInput): Promise<Result<RecipeDraft, Failure>> {
    this.lastUpsertInput = input;
    this.upsertCallCount += 1;
    return Promise.resolve(
      this.config.upsertDraftResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  deleteDraft(id: string): Promise<Result<void, Failure>> {
    this.lastDeleteId = id;
    this.deleteCallCount += 1;
    return Promise.resolve(this.config.deleteDraftResult ?? ok(undefined));
  }
}
