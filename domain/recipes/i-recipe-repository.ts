import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';

export interface IRecipeRepository {
  listActiveRecipes(): Promise<Result<Recipe[], Failure>>;
  getRecipe(id: string): Promise<Result<Recipe, Failure>>;
}
