const DEFAULT_API_BASE_URL = 'http://144.24.239.155:3000';

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;

export const HEALTH_URL: string = API_BASE_URL.replace(/\/$/, '') + '/health';

export const AUTH_LOGIN_PATH = '/auth/login';
export const AUTH_REGISTER_PATH = '/auth/register';

export const RECIPES_PAGE_SIZE = 30;

export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
