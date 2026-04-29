// Server root — the bare host:port. Override with EXPO_PUBLIC_API_BASE_URL
// (kept under the existing env var name for backward compat with any device
// already shipping with that override).
const DEFAULT_SERVER_URL = 'http://144.24.239.155:3000';

const SERVER_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_SERVER_URL;

// /health is unversioned on the backend (mounted directly on the Express app,
// not under /api/v1).
export const HEALTH_URL: string = `${SERVER_URL}/health`;

// HttpClient.baseURL — every relative `url:` in the repositories resolves
// under here, so the v1 prefix lives in one place.
export const API_BASE_URL: string = `${SERVER_URL}/api/v1`;

export const AUTH_LOGIN_PATH = '/auth/login';
export const AUTH_REGISTER_PATH = '/auth/register';

export const RECIPES_PAGE_SIZE = 30;

export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

// Shared AES-256-GCM key for the /api/v1 envelope. Must equal the backend's
// API_AES_KEY (`openssl rand -hex 32`). Override at build time via
// EXPO_PUBLIC_API_AES_KEY. NOTE: this key lives in the binary and is
// extractable via reverse engineering — see backend PR for the security
// caveat. TLS is the proper transport-layer fix.
const DEFAULT_AES_KEY_HEX =
  '0000000000000000000000000000000000000000000000000000000000000000';

export const API_AES_KEY_HEX: string =
  process.env.EXPO_PUBLIC_API_AES_KEY?.toLowerCase() ?? DEFAULT_AES_KEY_HEX;
