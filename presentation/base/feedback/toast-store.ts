import { create } from 'zustand';
import { MAX_VISIBLE_TOASTS } from '@presentation/base/feedback/toast-model';
import type { ToastInput } from '@presentation/base/feedback/toast-input';
import type { ToastItem } from '@presentation/base/feedback/toast-item';

let counter = 0;
const nextId = (): string => {
  counter += 1;
  return `toast-${Date.now()}-${counter}`;
};

export interface ToastStoreState {
  toasts: ToastItem[];
  /** Enqueue a toast and return its id (so the caller can dismiss it early). */
  show: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Global, app-wide toast queue. A singleton module store (mirrors `alarmStore`)
 * so any layer can surface feedback via the `showToast` / `showErrorToast`
 * helpers without prop-drilling. Rendered once by `ToastHost` at the root.
 */
export const toastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  show: (input) => {
    const id = nextId();
    // Keep only the most recent MAX_VISIBLE_TOASTS so a burst never floods the UI.
    set((s) => ({ toasts: [...s.toasts, { ...input, id }].slice(-MAX_VISIBLE_TOASTS) }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
