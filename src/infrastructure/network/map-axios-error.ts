import { AxiosError } from 'axios';
import {
  type Failure,
  NetworkFailure,
  TimeoutFailure,
  UnknownFailure,
  ValidationFailure,
} from '@core/failure';
import { failureFromResponse } from '@infrastructure/network/failure-from-response';
import { EnvelopeDecryptError } from '@infrastructure/crypto/envelope-decrypt-error';

/**
 * Maps a thrown request error to a domain `Failure`.
 *
 * WHY: the Recipely backend wraps errors as `{ error: { code, message, field? } }`
 * inside the AES envelope. The response interceptor decrypts it, then this maps
 * `code` → domain Failure (see `failureFromResponse`) so controller/store code
 * never sees HTTP quirks. A failed envelope decrypt surfaces as a
 * `ValidationFailure`; timeouts and connection errors get their own subtypes.
 */
export const mapAxiosError = (error: unknown): Failure => {
  if (error instanceof EnvelopeDecryptError) {
    return new ValidationFailure(`Bad envelope: ${error.message}`);
  }
  if (!(error instanceof AxiosError)) {
    return new UnknownFailure('Unexpected error', error);
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new TimeoutFailure('Request timed out');
  }

  if (error.response) {
    return failureFromResponse(error.response.status, error.response.data);
  }
  if (error.request) {
    return new NetworkFailure(error.message || 'Network unreachable');
  }
  return new UnknownFailure(error.message, error);
};
