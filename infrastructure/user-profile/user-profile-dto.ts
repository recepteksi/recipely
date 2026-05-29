// Wire shape returned by the Recipely backend `GET /api/v1/users/:id`.
// Keep in sync with recipely-backend user profile response.

export interface UserProfileDto {
  id: string;
  displayName: string;
  photoUrl: string | null;
  recipeCount: number;
  totalLikes: number;
  totalViews: number;
  joinedAt: string;
}
