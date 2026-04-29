import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/ciphers/utils.js';

// Wire-format envelope shared with recipely-backend. `payload` is base64 of
// (ciphertext || 16-byte auth tag); `iv` is base64 of a fresh 12-byte random
// IV per encryption. Plaintext is JSON of `{ data: <T> }` on success or
// `{ error: ... }` on failure — same as the backend.
export interface Envelope {
  payload: string;
  iv: string;
}

const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

export function keyFromHex(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('AES key must be 64 hex chars (32 bytes)');
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  // RN/Expo provide a global `btoa`. fall back to Buffer for tests under jest-expo.
  if (typeof globalThis.btoa === 'function') return globalThis.btoa(binary);
  return Buffer.from(bytes).toString('base64');
}

function fromBase64(b64: string): Uint8Array {
  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

export class EnvelopeDecryptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvelopeDecryptError';
  }
}

export function encryptEnvelope(plain: unknown, key: Uint8Array): Envelope {
  const iv = randomBytes(IV_BYTES);
  const cipher = gcm(key, iv);
  const plaintext = new TextEncoder().encode(JSON.stringify(plain));
  const sealed = cipher.encrypt(plaintext); // includes auth tag at the end
  return {
    payload: toBase64(sealed),
    iv: toBase64(iv),
  };
}

export function decryptEnvelope(envelope: Envelope, key: Uint8Array): unknown {
  if (typeof envelope.payload !== 'string' || typeof envelope.iv !== 'string') {
    throw new EnvelopeDecryptError('Envelope missing payload or iv');
  }
  const iv = fromBase64(envelope.iv);
  if (iv.length !== IV_BYTES) {
    throw new EnvelopeDecryptError(`IV must decode to ${IV_BYTES} bytes`);
  }
  const sealed = fromBase64(envelope.payload);
  if (sealed.length < AUTH_TAG_BYTES + 1) {
    throw new EnvelopeDecryptError('Payload shorter than auth tag');
  }
  try {
    const plain = gcm(key, iv).decrypt(sealed);
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (err) {
    throw new EnvelopeDecryptError(
      `Failed to decrypt: ${err instanceof Error ? err.message : 'unknown'}`,
    );
  }
}
