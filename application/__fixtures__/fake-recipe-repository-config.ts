import type { Failure } from '@core/failure';
import type { Result } from '@core/result/result';
import type { Recipe } from '@domain/recipes/recipe';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

export interface FakeRecipeRepositoryConfig {
  listActiveRecipesResult?: Result<RecipeSummary[], Failure>;
  listTrendingRecipesResult?: Result<RecipeSummary[], Failure>;
  listMyRecipesResult?: Result<RecipeSummary[], Failure>;
  getRecipeResult?: Result<Recipe, Failure>;
  createRecipeResult?: Result<Recipe, Failure>;
  generateRecipeResult?: Result<Recipe, Failure>;
  importInstagramRecipeResult?: Result<Recipe, Failure>;
  refineRecipeResult?: Result<Recipe, Failure>;
  updateRecipeResult?: Result<Recipe, Failure>;
  deleteRecipeResult?: Result<void, Failure>;
}
