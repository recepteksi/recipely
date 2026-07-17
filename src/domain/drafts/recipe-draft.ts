import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { ChatMessage } from '@domain/drafts/chat-message';

/**
 * A persisted, server-owned recipe draft. Modelled as a plain interface rather
 * than an `Entity` because it is a transient working document of the AI create
 * flow with no domain invariants beyond what the backend enforces.
 * `createdAt` / `updatedAt` are domain `Date`s (mapped from ISO strings).
 */
export interface RecipeDraft {
  id: string;
  ownerId: string;
  prompt: string;
  snapshot: DraftRecipeSnapshot;
  chatHistory: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
