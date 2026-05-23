import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { CuisineKey } from '@domain/recipes/cuisine-key';
import type { RecipeCategory } from '@domain/recipes/recipe-category';
import type { Difficulty } from '@domain/recipes/difficulty';

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
  imageUri: string;
  imageFileName: string;
  imageMimeType: string;
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
  imageUri?: string;
  imageFileName?: string;
  imageMimeType?: string;
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
