/**
 * Discriminated union describing the profile stats row: still loading, failed
 * (with a retry handler), loaded (carrying the raw counts the row formats), or
 * idle (nothing to show yet).
 */
export type ProfileStatsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string; onRetry: () => void }
  | {
      status: 'loaded';
      recipeCount: number;
      totalLikes: number;
      totalViews: number;
      savedCount: number;
    };
