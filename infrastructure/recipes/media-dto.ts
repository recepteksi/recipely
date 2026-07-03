// Wire shape returned by the Recipely backend for a single recipe media item.
// Keep in sync with recipely-backend `application/recipes/dtos/recipe.dto.ts`.
export interface MediaDto {
  id: string;
  type: 'image' | 'video';
  url: string;
  position: number;
}
