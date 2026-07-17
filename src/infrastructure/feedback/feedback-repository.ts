import { fail, ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { HttpClient } from '@infrastructure/network/http-client';
import type { IFeedbackRepository } from '@domain/feedback/i-feedback-repository';
import type { FeedbackSubmission } from '@domain/feedback/feedback-submission';
import { toFeedbackRequestDto } from '@infrastructure/feedback/feedback-mapper';
import { FEEDBACK_PATH } from '@infrastructure/constants/api';

/**
 * Implements `IFeedbackRepository` against the Recipely backend.
 * Sends a `POST /feedback` request with the AES-encrypted envelope managed
 * by `HttpClient`. The response body is ignored on success.
 */
export class FeedbackRepository implements IFeedbackRepository {
  constructor(private readonly http: HttpClient) {}

  async submitFeedback(input: FeedbackSubmission): Promise<Result<void, Failure>> {
    const result = await this.http.request({
      method: 'POST',
      url: FEEDBACK_PATH,
      data: toFeedbackRequestDto(input),
    });

    if (!result.ok) {
      return fail(result.failure);
    }

    return ok(void 0);
  }
}
