import type { Ionicons } from '@expo/vector-icons';
import type { Failure } from '@presentation/base/types';
import { t } from '@presentation/i18n';
import type { Severity } from '@presentation/base/theme/error-surfaces';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Full-screen / section content for a failure: a warm title and a plain,
 * actionable body. Always localized — never a raw backend string or stack
 * trace.
 */
export interface FailureContent {
  title: string;
  body: string;
}

// The per-code entries in the `errors` i18n namespace (each is { title, body, short }).
type FailureContentKey =
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

// WHY: every failure carries a stable `code` (set by its class). The user-facing
// copy is selected from that code alone, so the same error always reads the same
// way across every screen — never the raw `message`, which may be a backend
// sentence, an i18n key, or an "HTTP 400" placeholder.
const CODE_TO_KEY: Record<string, FailureContentKey> = {
  network: 'network',
  timeout: 'timeout',
  server: 'server',
  not_found: 'notFound',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  conflict: 'conflict',
  rate_limit: 'rateLimit',
  validation: 'validation',
  unknown: 'unknown',
};

const CODE_TO_SEVERITY: Record<string, Severity> = {
  not_found: 'neutral',
  rate_limit: 'warning',
};

const CODE_TO_ICON: Record<string, IoniconName> = {
  network: 'cloud-offline-outline',
  timeout: 'time-outline',
  server: 'warning-outline',
  not_found: 'search-outline',
  unauthorized: 'lock-closed-outline',
  forbidden: 'lock-closed-outline',
  conflict: 'alert-circle-outline',
  rate_limit: 'hourglass-outline',
  validation: 'alert-circle-outline',
  unknown: 'sad-outline',
};

const keyFor = (failure: Failure): FailureContentKey =>
  CODE_TO_KEY[failure.code] ?? 'unknown';

/** The semantic severity a failure should be rendered with (defaults to danger). */
export const failureSeverity = (failure: Failure): Severity =>
  CODE_TO_SEVERITY[failure.code] ?? 'danger';

/** Localized title + body for a full-screen or section error state. */
export const failureContent = (failure: Failure): FailureContent => {
  const entry = t().errors[keyFor(failure)];
  return { title: entry.title, body: entry.body };
};

/** Short, single-line message for a transient toast. */
export const failureToastMessage = (failure: Failure): string =>
  t().errors[keyFor(failure)].short;

const FALLBACK_ICON: IoniconName = 'sad-outline';

/** The illustration icon for a failure's full-screen / section state. */
export const failureIcon = (failure: Failure): IoniconName =>
  CODE_TO_ICON[failure.code] ?? FALLBACK_ICON;
