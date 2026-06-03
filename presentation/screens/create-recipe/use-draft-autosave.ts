import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@domain/drafts/chat-message';
import type { UpsertDraftStoreInput } from '@application/drafts/drafts-store';
import type { EditableRecipe } from '@presentation/screens/create-recipe/editable-recipe';
import {
  editableHasContent,
  editableToSnapshot,
} from '@presentation/screens/create-recipe/recipe-mapping';

const DEBOUNCE_MS = 500;

export interface UseDraftAutosaveArgs {
  enabled: boolean;
  draftId: string;
  prompt: string;
  recipe: EditableRecipe;
  chatHistory: ChatMessage[];
  upsertDraft: (input: UpsertDraftStoreInput) => Promise<unknown>;
}

/**
 * Debounced draft persistence: whenever the editable model or chat changes in
 * the preview phase (and the flow is enabled), the working recipe is upserted
 * to the backend ~500ms later so an accidental exit never loses work. Disabled
 * while editing an already-published recipe.
 */
export const useDraftAutosave = ({
  enabled,
  draftId,
  prompt,
  recipe,
  chatHistory,
  upsertDraft,
}: UseDraftAutosaveArgs): void => {
  // Keep the latest values in a ref so the timer always reads fresh data
  // without re-arming on every keystroke beyond the debounce window.
  const latest = useRef({ prompt, recipe, chatHistory });
  latest.current = { prompt, recipe, chatHistory };

  useEffect(() => {
    if (!enabled || !editableHasContent(recipe)) return;
    const id = setTimeout(() => {
      void upsertDraft({
        id: draftId,
        prompt: latest.current.prompt,
        snapshot: editableToSnapshot(latest.current.recipe),
        chatHistory: latest.current.chatHistory,
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [enabled, draftId, recipe, chatHistory, upsertDraft]);
};
