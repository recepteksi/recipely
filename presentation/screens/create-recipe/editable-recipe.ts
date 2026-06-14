import type { MediaItem } from '@domain/recipes/media-item';
import type { Difficulty } from '@domain/recipes/difficulty';
import type { RecipeCategory } from '@domain/recipes/recipe-category';
import type { CuisineKey } from '@domain/recipes/cuisine-key';

/**
 * The live, inline-editable working model of a recipe inside the unified AI
 * create flow. Cuisine is a structured `CuisineKey` chosen from the catalog
 * (no longer free text); `null` means the user has not picked one yet.
 * `category` is always set (defaulting to the generated recipe's category) so
 * publishing preserves it.
 */
export interface EditableRecipe {
  name: string;
  cuisine: CuisineKey | null;
  category: RecipeCategory;
  difficulty: Difficulty;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  media: MediaItem[];
}
