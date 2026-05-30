/**
 * Result of requesting (or resending) a registration email-verification code.
 * The account is NOT created yet — the user must confirm the 6-digit code sent
 * to `email` within `expiresInSeconds` via `IAuthRepository.verifyRegistration`.
 */
export interface RegistrationChallenge {
  readonly email: string;
  readonly expiresInSeconds: number;
}
