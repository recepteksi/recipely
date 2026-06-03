import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { ChatMessage } from '@domain/drafts/chat-message';

/** A single page of recipe drafts plus the total count for pagination. */
export interface PagedDrafts {
  items: RecipeDraft[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Payload for creating or updating a draft. `id` is supplied by the caller (a
 * client-generated UUID) so the same operation handles both create and update;
 * the backend validates it as `z.string().uuid()`.
 */
export interface UpsertDraftInput {
  id: string;
  prompt: string;
  snapshot: DraftRecipeSnapshot;
  chatHistory: ChatMessage[];
}

export interface IRecipeDraftRepository {
  listDrafts(page: number, pageSize: number): Promise<Result<PagedDrafts, Failure>>;
  /**
   * Returns the user's most recently updated draft, or `ok(null)` when they
   * have none. A backend 404 is treated as "no draft", not an error.
   */
  getLatestDraft(): Promise<Result<RecipeDraft | null, Failure>>;
  getDraft(id: string): Promise<Result<RecipeDraft, Failure>>;
  upsertDraft(input: UpsertDraftInput): Promise<Result<RecipeDraft, Failure>>;
  deleteDraft(id: string): Promise<Result<void, Failure>>;
}
