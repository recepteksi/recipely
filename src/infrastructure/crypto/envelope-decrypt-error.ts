/**
 * Thrown when AES-GCM decryption of an envelope fails, either because the
 * ciphertext is malformed or the auth tag does not match (tampered payload).
 */
export class EnvelopeDecryptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvelopeDecryptError';
  }
}
