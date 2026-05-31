import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { MediaType } from '@domain/recipes/media-item';
import type { CuisineKey } from '@domain/recipes/cuisine-key';
import type { RecipeCategory } from '@domain/recipes/recipe-category';
import type { Difficulty } from '@domain/recipes/difficulty';

/**
 * A single media file attached to a recipe on create/update. `uri` is either a
 * local file URI (uploaded as multipart) or an already-hosted `https://` URL
 * (kept verbatim on update). The list order is the gallery order; index 0 is
 * the cover.
 */
export interface RecipeMediaUpload {
  uri: string;
  fileName: string;
  mimeType: string;
  type: MediaType;
}

export type RecipeSort =
  | 'popular'
  | 'rating'
  | 'time'
  | 'newest'
  | 'mostLiked'
  | 'alphabetical'
  | 'mostCommented';

export interface RecipeFilters {
  search?: string;
  cuisines?: CuisineKey[];
  categories?: RecipeCategory[];
  difficulties?: Difficulty[];
  maxTime?: number;
  sort?: RecipeSort;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateRecipeInput {
  name: Record<string, string>;
  cuisine: CuisineKey;
  category: RecipeCategory;
  difficulty: Difficulty;
  ingredients: Record<string, string[]>;
  instructions: Record<string, string[]>;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  // Ordered gallery (cover first). At least one image is required.
  media: RecipeMediaUpload[];
  rating?: number;
  tags?: Record<string, string[]>;
  mealType?: Record<string, string[]>;
  isPublished?: boolean;
  locale?: string;
}

export interface UpdateRecipeInput {
  name?: Record<string, string>;
  cuisine?: CuisineKey;
  category?: RecipeCategory;
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

export type CreateRecipeProgressCallback = (loaded: number, total: number) => void;

export interface IRecipeRepository {
  listActiveRecipes(filters?: RecipeFilters): Promise<Result<Recipe[], Failure>>;
  listMyRecipes(): Promise<Result<Recipe[], Failure>>;
  getRecipe(id: string): Promise<Result<Recipe, Failure>>;
  createRecipe(
    input: CreateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>>;
  generateRecipe(prompt: string, locale: string): Promise<Result<Recipe, Failure>>;
  updateRecipe(
    id: string,
    input: UpdateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>>;
  deleteRecipe(id: string): Promise<Result<void, Failure>>;
}
