import type { RegistrationChallenge } from '@domain/auth/registration-challenge';
import { DEFAULT_CODE_TTL_SECONDS } from '@infrastructure/constants/api';
import type { RegistrationChallengeDto } from '@infrastructure/auth/registration-challenge-dto';

/**
 * Maps a registration challenge DTO to its domain value. Prefers the backend's
 * absolute expiry and synthesises one from the remaining seconds only when an
 * older backend omits it.
 */
export const toChallenge = (
  email: string,
  dto: RegistrationChallengeDto,
): RegistrationChallenge => {
  const expiresInSeconds = dto.expiresInSeconds ?? DEFAULT_CODE_TTL_SECONDS;
  const expiresAt =
    dto.expiresAt ?? new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  return {
    email: dto.email ?? email,
    expiresInSeconds,
    expiresAt,
  };
};
