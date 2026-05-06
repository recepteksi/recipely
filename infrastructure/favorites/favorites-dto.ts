/**
 * Data Transfer Objects for favorites/bookmarks.
 * Used for API responses from the backend.
 */

export interface FavoriteDtoResponse {
  readonly id: string;
  readonly userId: string;
  readonly recipeId: string;
  readonly createdAt: string; // ISO date string
}
