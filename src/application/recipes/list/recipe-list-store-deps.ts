import type { ListRecipesUseCase } from '@application/recipes/list/list-recipes-use-case';

export interface RecipeListStoreDeps {
  listRecipes: ListRecipesUseCase;
}
