import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { ChatMessage } from '@domain/drafts/chat-message';

export interface UpsertDraftStoreInput {
  id: string;
  prompt: string;
  snapshot: DraftRecipeSnapshot;
  chatHistory: ChatMessage[];
}
