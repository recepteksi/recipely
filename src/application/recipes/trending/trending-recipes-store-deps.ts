import type { ListTrendingRecipesUseCase } from '@application/recipes/trending/list-trending-recipes-use-case';

export interface TrendingRecipesStoreDeps {
  listTrendingRecipes: ListTrendingRecipesUseCase;
}
