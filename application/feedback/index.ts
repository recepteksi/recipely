/**
 * Barrel export for the feedback application layer.
 */
export { SubmitFeedbackUseCase } from '@application/feedback/submit-feedback-use-case';
export {
  configureFeedbackStore,
  type FeedbackStore,
  type FeedbackStoreState,
  type ConfigureFeedbackStoreOptions,
} from '@application/feedback/feedback-store';
