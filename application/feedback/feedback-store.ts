import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { UnknownFailure, type Failure } from '@core/failure';
import type { FeedbackSubmission } from '@domain/feedback/feedback-submission';
import type { SubmitFeedbackUseCase } from '@application/feedback/submit-feedback-use-case';

export interface FeedbackStoreState {
  isSubmitting: boolean;
  error: Failure | null;
  /** Returns `true` on success, `false` on failure (sets `error`). */
  submit: (input: FeedbackSubmission) => Promise<boolean>;
  /** Clears `error` and resets `isSubmitting` to `false`. */
  reset: () => void;
}

export type FeedbackStore = UseBoundStore<StoreApi<FeedbackStoreState>>;

export interface ConfigureFeedbackStoreOptions {
  submitFeedbackUseCase: SubmitFeedbackUseCase;
}

/**
 * Creates the Zustand store for the Help & Feedback screen.
 * `submit` returns a boolean so the UI can trigger navigation on success
 * without reading store state in the same render cycle.
 */
export const configureFeedbackStore = (deps: ConfigureFeedbackStoreOptions): FeedbackStore => {
  const { submitFeedbackUseCase } = deps;

  return create<FeedbackStoreState>((set) => ({
    isSubmitting: false,
    error: null,
    submit: async (input: FeedbackSubmission): Promise<boolean> => {
      try {
        set({ isSubmitting: true, error: null });
        const result = await submitFeedbackUseCase.execute(input);
        if (!result.ok) {
          set({ isSubmitting: false, error: result.failure });
          return false;
        }
        set({ isSubmitting: false });
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        set({ isSubmitting: false, error: new UnknownFailure(errorMsg) });
        return false;
      }
    },
    reset: () => set({ isSubmitting: false, error: null }),
  }));
};
