// Server root — the bare host:port. Override with EXPO_PUBLIC_API_BASE_URL
// (kept under the existing env var name for backward compat with any device
// already shipping with that override).
const DEFAULT_SERVER_URL = "https://api.recipely.net";

const SERVER_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  DEFAULT_SERVER_URL;

// /health is unversioned on the backend (mounted directly on the Express app,
// not under /api/v1).
export const HEALTH_URL: string = `${SERVER_URL}/health`;

// HttpClient.baseURL — every relative `url:` in the repositories resolves
// under here, so the v1 prefix lives in one place.
export const API_BASE_URL: string = `${SERVER_URL}/api/v1`;

// Upload endpoint is mounted at the server root (outside /api/v1), so it
// needs an absolute URL that bypasses HttpClient's baseURL.
export const UPLOAD_URL: string = `${SERVER_URL}/upload`;

export const AUTH_LOGIN_PATH = "/auth/login";
export const AUTH_REGISTER_PATH = "/auth/register";
export const AUTH_REGISTER_VERIFY_PATH = "/auth/register/verify";
export const AUTH_REGISTER_RESEND_PATH = "/auth/register/resend";
export const AUTH_SOCIAL_PATH = "/auth/social";

// Fallback verification-code lifetime (seconds) used to seed the resend
// countdown when the backend response omits expiresInSeconds. Mirrors the
// backend CODE_TTL_MS (10 minutes).
export const DEFAULT_CODE_TTL_SECONDS = 600;

export const RECIPES_PAGE_SIZE = 30;

export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

// WHY: image uploads regularly exceed 10s on cellular (a 3 MB JPEG at 1 Mbps
// upload is ~25s). The default 10s budget surfaces as `ECONNABORTED` →
// NetworkFailure('Request timed out'), which mobile users see as "Network
// error". Give multipart its own headroom independent of JSON timeouts.
export const MULTIPART_UPLOAD_TIMEOUT_MS = 60_000;

// Shared AES-256-GCM key for the /api/v1 envelope. Must equal the backend's
// API_AES_KEY (`openssl rand -hex 32`). Override at build time via
// EXPO_PUBLIC_API_AES_KEY. NOTE: this key lives in the binary and is
// extractable via reverse engineering — see backend PR for the security
// caveat. TLS is the proper transport-layer fix.
const DEFAULT_AES_KEY_HEX =
  "0000000000000000000000000000000000000000000000000000000000000000";

export const API_AES_KEY_HEX: string =
  process.env.EXPO_PUBLIC_API_AES_KEY?.toLowerCase() ?? DEFAULT_AES_KEY_HEX;

// OAuth 2.0 Web client ID from Firebase Console (Authentication → Sign-in method → Google).
// Required for Android Google Sign-In and for verifying the ID token.
// Override at build time via EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.
export const GOOGLE_WEB_CLIENT_ID: string =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
