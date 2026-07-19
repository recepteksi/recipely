import { decodeJwtPayload } from '@infrastructure/network/jwt/decode-jwt';

const FALLBACK_EXPIRES_MS = 3_600_000;

/**
 * Derives the session expiry from a JWT's `exp` claim, falling back to one hour
 * from now when the token is unparseable or omits `exp`.
 */
export const expiresAtFromToken = (token: string): Date => {
  const claims = decodeJwtPayload(token);
  if (claims.ok && typeof claims.value.exp === 'number') {
    return new Date(claims.value.exp * 1000);
  }
  return new Date(Date.now() + FALLBACK_EXPIRES_MS);
};
