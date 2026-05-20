import type { CuisineKey } from '@domain/recipes/cuisine-key';
import type { RecipeCategory } from '@domain/recipes/recipe-category';
import type { Difficulty } from '@domain/recipes/difficulty';

// Wire shape returned by the Recipely backend for a single recipe.
// Keep in sync with recipely-backend `application/recipes/dtos/recipe.dto.ts`.
export interface MediaDto {
  id: string;
  type: 'image' | 'video';
  url: string;
  position: number;
}

export interface RecipeDto {
  id: string;
  name: string;
  cuisine: CuisineKey;
  category: RecipeCategory;
  difficulty: Difficulty;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  image: string;
  rating: number;
  tags: string[];
  mealType: string[];
  ownerId: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  media?: MediaDto[];
  createdAt: string;
  updatedAt: string;
}
