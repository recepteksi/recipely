import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { ChatMessage } from '@domain/drafts/chat-message';

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
