export interface HttpClientOptions {
  baseUrl: string;
  tokenProvider: () => Promise<string | null>;
  /**
   * Reads the active language for `Accept-Language`. Required on purpose: a
   * defaulted locale would silently ship every request in the wrong language
   * the moment the wiring breaks, which is exactly the bug this closes.
   */
  localeProvider: () => string;
  timeoutMs?: number;
  // WHY: keeps logging opt-in — production builds flip this off to drop PII out of logcat/xcode.
  enableLogging?: boolean;
  /**
   * Invoked whenever the backend returns 401, so the app can clear the session
   * and route to login. Side-effect only — the request still resolves to an
   * UnauthorizedFailure.
   */
  onUnauthorized?: () => void;
}
