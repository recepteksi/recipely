/**
 * The data collected by the Help & Feedback form and passed to the use case.
 * `subject` corresponds to the "Title" field and may be an empty string.
 * `message` is required and must be non-empty (enforced by the use case).
 */
export interface FeedbackSubmission {
  readonly subject: string;
  readonly message: string;
}
