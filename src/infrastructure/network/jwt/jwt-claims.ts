/** Payload claims we read from a backend JWT (never signature-verified on device). */
export interface JwtClaims {
  sub?: string;
  email?: string;
  exp?: number; // seconds since epoch
  iat?: number;
}
