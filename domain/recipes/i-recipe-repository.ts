import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { MediaType } from '@domain/recipes/media-item';
import type { Difficulty } from '@domain/recipes/difficulty';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';

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
  // Opaque taxonomy keys (backend owns the full catalog); not narrowed to the
  // local enums so newer backend cuisines/categories can be filtered on.
  cuisines?: string[];
  categories?: string[];
  difficulties?: Difficulty[];
  maxTime?: number;
  sort?: RecipeSort;
  sortOrder?: 'asc' | 'desc';
}

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
  /**
   * Imports an Instagram reel/video into a full preview `Recipe`. The result is
   * NOT persisted (same contract as `generateRecipe` — throwaway id,
   * `isPublished: false`, empty image); the client decides whether to publish
   * it via `createRecipe`. The locale rides the `Accept-Language` header.
   *
   * This call can be slow (the backend runs download + transcription + vision,
   * up to ~120s), so the implementation uses an extended request timeout.
   */
  importInstagramRecipe(url: string, locale: string): Promise<Result<Recipe, Failure>>;
  /**
   * Refines an in-progress recipe against a free-text instruction and returns a
   * full preview `Recipe`. The result is NOT persisted (same contract as
   * `generateRecipe`); the locale rides the `Accept-Language` header.
   */
  refineRecipe(
    currentRecipe: DraftRecipeSnapshot,
    instruction: string,
  ): Promise<Result<Recipe, Failure>>;
  updateRecipe(
    id: string,
    input: UpdateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>>;
  deleteRecipe(id: string): Promise<Result<void, Failure>>;
}
