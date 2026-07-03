import type { Failure } from '@core/failure';
import type { FeedbackSubmission } from '@domain/feedback/feedback-submission';

export interface FeedbackStoreState {
  isSubmitting: boolean;
  error: Failure | null;
  /** Returns `true` on success, `false` on failure (sets `error`). */
  submit: (input: FeedbackSubmission) => Promise<boolean>;
  /** Clears `error` and resets `isSubmitting` to `false`. */
  reset: () => void;
}
