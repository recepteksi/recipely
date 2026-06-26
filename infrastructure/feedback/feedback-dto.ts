import type { FeedbackCategory } from '@domain/feedback/feedback-category';

/** Wire format for `POST /feedback`. `subject` is omitted when empty. */
export interface FeedbackRequestDto {
  category: FeedbackCategory;
  subject?: string;
  message: string;
}
