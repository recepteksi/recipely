/** Host-app callbacks and providers injected into the infrastructure wiring. */
export interface InfrastructureOptions {
  localeProvider?: () => string;
  /**
   * Invoked on every backend 401. Wired into the HTTP client so the app can
   * clear the session and route to login; the auth store gates the actual
   * logout (a 401 outside an authenticated session is a no-op).
   */
  onUnauthorized?: () => void;
}
