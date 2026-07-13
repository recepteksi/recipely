import type { Envelope } from '@infrastructure/crypto/envelope';

/** Narrows an arbitrary response body to an AES-GCM `Envelope`. */
export const isEnvelope = (body: unknown): body is Envelope => {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Envelope).payload === 'string' &&
    typeof (body as Envelope).iv === 'string'
  );
};
