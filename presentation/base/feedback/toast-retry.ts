/** Optional retry affordance attached to an error toast. */
export interface ToastRetry {
  onRetry: () => void;
  label?: string;
}
