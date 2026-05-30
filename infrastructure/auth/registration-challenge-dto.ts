// Wire shape returned by the Recipely backend POST /auth/register and
// /auth/register/resend. Matches recipely-backend `auth.controller.ts`.
// `devCode` is only present when the backend runs with EXPOSE_DEV_CODE on.

export interface RegistrationChallengeDto {
  message: string;
  email?: string;
  expiresInSeconds?: number;
  // Absolute ISO-8601 expiry of the verification code. The client drives its
  // countdown off this so back/forward navigation keeps one stable timer.
  expiresAt?: string;
  devCode?: string;
}
