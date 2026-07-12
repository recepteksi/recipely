import type { Severity } from '@presentation/base/theme/severity';

/** A toast as requested by a caller (id is assigned by the store). */
export interface ToastInput {
  severity: Severity;
  message: string;
  /** Optional trailing action (e.g. "Try again", "Undo"). */
  actionLabel?: string;
  onAction?: () => void;
  /** Override the default visible duration; pass 0 to disable auto-dismiss. */
  durationMs?: number;
}
