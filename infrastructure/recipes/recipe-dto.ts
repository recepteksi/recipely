// Wire shape returned by the Recipely backend for a single recipe.
// Keep in sync with recipely-backend `application/recipes/dtos/recipe.dto.ts`.
export interface RecipeDto {
  id: string;
  name: string;
  cuisine: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  image: string;
  rating: number;
  tags: string[];
  mealType: string[];
  ownerId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}
