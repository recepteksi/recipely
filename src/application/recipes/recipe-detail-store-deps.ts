import type { GetRecipeUseCase } from '@application/recipes/get-recipe-use-case';

export interface RecipeDetailStoreDeps {
  getRecipe: GetRecipeUseCase;
}
