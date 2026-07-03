import type { ListTrendingRecipesUseCase } from '@application/recipes/list-trending-recipes-use-case';

export interface TrendingRecipesStoreDeps {
  listTrendingRecipes: ListTrendingRecipesUseCase;
}
