import type { ToastInput } from '@presentation/base/feedback/toast-input';

/** A live toast tracked by the store. */
export interface ToastItem extends ToastInput {
  id: string;
}
