import type { ListRecipesUseCase } from '@application/recipes/list-recipes-use-case';

export interface RecipeListStoreDeps {
  listRecipes: ListRecipesUseCase;
}
