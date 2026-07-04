import { useCallback, useState } from 'react';

export interface UseGuestGateResult {
  /** Whether the "sign in to continue" prompt is currently open. */
  promptVisible: boolean;
  /** The per-action message passed to the last `requestGate` call that opened the prompt, if any. */
  promptMessage: string | undefined;
  /**
   * Runs `action` immediately when signed in; otherwise opens the prompt
   * instead of running it. `message` is optional per-action copy (e.g. "Sign
   * in to like this recipe.") surfaced to the caller as `promptMessage` — the
   * prompt UI falls back to a generic message when it's omitted.
   */
  requestGate: (action: () => void, message?: string) => void;
  /** Dismisses the prompt without running the gated action. */
  closePrompt: () => void;
}

/**
 * Gates a guest-blocked interaction (like, save, comment, ...) behind
 * authentication. Replaces the previous pattern of each handler silently
 * early-returning on `!userId` with a visible "sign in to continue" prompt:
 * call sites wrap the press handler as `onPress={() => requestGate(() => doThing())}`
 * and render a `SignInPromptSheet` bound to `promptVisible` / `closePrompt`.
 */
export const useGuestGate = (userId: string | null): UseGuestGateResult => {
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | undefined>(undefined);

  const requestGate = useCallback(
    (action: () => void, message?: string): void => {
      if (userId !== null) {
        action();
        return;
      }
      setPromptMessage(message);
      setPromptVisible(true);
    },
    [userId],
  );

  const closePrompt = useCallback((): void => {
    setPromptVisible(false);
  }, []);

  return { promptVisible, promptMessage, requestGate, closePrompt };
};
