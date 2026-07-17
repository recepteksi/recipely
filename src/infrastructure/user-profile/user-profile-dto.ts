// Wire shape returned by the Recipely backend `GET /api/v1/users/:id`.
// Keep in sync with recipely-backend user profile response.

export interface UserProfileDto {
  id: string;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  recipeCount: number;
  totalLikes: number;
  totalViews: number;
  // Follow-related fields (followerCount/followingCount/isFollowedByMe) exist
  // on the wire but are intentionally not mapped into the domain — the follow
  // concept was dropped from the product.
  joinedAt: string;
}
