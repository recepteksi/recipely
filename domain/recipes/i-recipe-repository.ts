import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';
import type { CreateRecipeInput } from '@domain/recipes/create-recipe-input';
import type { UpdateRecipeInput } from '@domain/recipes/update-recipe-input';
import type { CreateRecipeProgressCallback } from '@domain/recipes/create-recipe-progress-callback';

export interface IRecipeRepository {
  listActiveRecipes(filters?: RecipeFilters): Promise<Result<Recipe[], Failure>>;
  /** Trending recipes for the discover rail, backed by `GET /recipes/trending`. */
  listTrendingRecipes(limit?: number): Promise<Result<Recipe[], Failure>>;
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
