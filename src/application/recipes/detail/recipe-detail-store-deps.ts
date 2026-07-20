import type { GetRecipeUseCase } from '@application/recipes/detail/get-recipe-use-case';

export interface RecipeDetailStoreDeps {
  getRecipe: GetRecipeUseCase;
}
