// Wire-format envelope shared with recipely-backend. `payload` is base64 of
// (ciphertext || 16-byte auth tag); `iv` is base64 of a fresh 12-byte random
// IV per encryption. Plaintext is JSON of `{ data: <T> }` on success or
// `{ error: ... }` on failure — same as the backend.
export interface Envelope {
  payload: string;
  iv: string;
}
