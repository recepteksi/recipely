import type { Difficulty } from '@domain/recipes/difficulty';
import type { RecipeMediaUpload } from '@domain/recipes/media/recipe-media-upload';

export interface UpdateRecipeInput {
  name?: Record<string, string>;
  cuisine?: string;
  category?: string;
  difficulty?: Difficulty;
  ingredients?: Record<string, string[]>;
  instructions?: Record<string, string[]>;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  // Full ordered gallery (cover first). Omit to leave media unchanged; when
  // provided it replaces the recipe's media. Local URIs are uploaded first,
  // remote `https://` URLs are kept as-is.
  media?: RecipeMediaUpload[];
  rating?: number;
  tags?: Record<string, string[]>;
  mealType?: Record<string, string[]>;
  isPublished?: boolean;
  locale?: string;
}
