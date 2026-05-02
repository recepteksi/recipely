import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export interface CreateRecipeInput {
  name: Record<string, string>;
  cuisine: Record<string, string>;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
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
  categoryId?: string | null;
  isPublished?: boolean;
  locale?: string;
}

export type CreateRecipeProgressCallback = (loaded: number, total: number) => void;

export interface IRecipeRepository {
  listActiveRecipes(): Promise<Result<Recipe[], Failure>>;
  getRecipe(id: string): Promise<Result<Recipe, Failure>>;
  createRecipe(
    input: CreateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>>;
}
