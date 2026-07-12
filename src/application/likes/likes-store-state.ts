import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeLikeState } from '@application/likes/recipe-like-state';

export interface LikesStoreState {
  /** Per-recipe like state overlay. Keyed by recipe id. */
  byRecipe: Record<string, RecipeLikeState>;
  /**
   * Seed the store with the like state that arrived from the API. No-op when
   * the entry is already present so that in-flight optimistic updates are not
   * overwritten by a stale network response. Use this from list views.
   */
  seed: (recipeId: string, likeCount: number, likedByMe: boolean) => void;
  /**
   * Sync the store from a fresh authoritative API response (e.g. recipe detail
   * endpoint). Unlike `seed`, this always writes the new values — unless an
   * optimistic toggle is currently in-flight — so the detail screen always
   * reflects the server-confirmed like state.
   */
  syncFromApi: (recipeId: string, likeCount: number, likedByMe: boolean) => void;
  /**
   * Toggle like with optimistic update; rolls back on failure. Returns the
   * `Result` so the caller can surface a toast when the toggle is rejected —
   * the optimistic rollback alone is easy to miss.
   */
  toggle: (recipeId: string) => Promise<Result<void, Failure>>;
}
