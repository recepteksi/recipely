import type { Severity } from '@presentation/base/theme/error-surfaces';

/** How long a toast stays before auto-dismissing, unless overridden per toast. */
export const DEFAULT_TOAST_DURATION_MS = 4000;

/** The most toasts shown at once; older ones are dropped so the stack stays calm. */
export const MAX_VISIBLE_TOASTS = 3;

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

/** A live toast tracked by the store. */
export interface ToastItem extends ToastInput {
  id: string;
}
