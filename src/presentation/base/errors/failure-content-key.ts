// The per-code entries in the `errors` i18n namespace (each is { title, body, short }).
export type FailureContentKey =
  | 'network'
  | 'timeout'
  | 'server'
  | 'notFound'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'rateLimit'
  | 'validation'
  | 'unknown';
