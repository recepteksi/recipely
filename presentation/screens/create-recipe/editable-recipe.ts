import type { MediaItem } from '@domain/recipes/media-item';
import type { Difficulty } from '@domain/recipes/difficulty';
import type { RecipeCategory } from '@domain/recipes/recipe-category';

/**
 * The live, inline-editable working model of a recipe inside the unified AI
 * create flow. Cuisine is a free-text string here (mapped to a `CuisineKey`
 * only at publish time) so the AI can return arbitrary cuisines and the user
 * can type freely. `category` is carried opaquely from the generated recipe so
 * publishing preserves it.
 */
export interface EditableRecipe {
  name: string;
  cuisine: string;
  category: RecipeCategory;
  difficulty: Difficulty;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  media: MediaItem[];
}
