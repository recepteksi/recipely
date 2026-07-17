/** View model returned by `useMyRecipesRefresh` for the My-Recipes tab bodies. */
export interface UseMyRecipesRefreshResult {
  /**
   * True only while a user-initiated pull is in flight — safe to bind straight
   * to `RefreshControl.refreshing`.
   */
  isRefreshing: boolean;
  /** Re-fetches whatever the active tab renders. */
  onRefresh: () => void;
}
