import type { Failure } from '@core/failure';
import type { Result } from '@core/result/result';
import type { Recipe } from '@domain/recipes/recipe';

export interface FakeRecipeRepositoryConfig {
  listActiveRecipesResult?: Result<Recipe[], Failure>;
  listTrendingRecipesResult?: Result<Recipe[], Failure>;
  listMyRecipesResult?: Result<Recipe[], Failure>;
  getRecipeResult?: Result<Recipe, Failure>;
  createRecipeResult?: Result<Recipe, Failure>;
  generateRecipeResult?: Result<Recipe, Failure>;
  importInstagramRecipeResult?: Result<Recipe, Failure>;
  refineRecipeResult?: Result<Recipe, Failure>;
  updateRecipeResult?: Result<Recipe, Failure>;
  deleteRecipeResult?: Result<void, Failure>;
}
