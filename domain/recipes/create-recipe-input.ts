import type { Difficulty } from '@domain/recipes/difficulty';
import type { RecipeMediaUpload } from '@domain/recipes/recipe-media-upload';

export interface CreateRecipeInput {
  name: Record<string, string>;
  // Opaque taxonomy key validated by the backend (the source of truth for the
  // full catalog); not narrowed to the local `CuisineKey`/`RecipeCategory`
  // enums, which only mirror a curated subset.
  cuisine: string;
  category: string;
  difficulty: Difficulty;
  ingredients: Record<string, string[]>;
  instructions: Record<string, string[]>;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  // Ordered gallery (cover first). At least one image is required.
  media: RecipeMediaUpload[];
  rating?: number;
  tags?: Record<string, string[]>;
  mealType?: Record<string, string[]>;
  isPublished?: boolean;
  locale?: string;
}
