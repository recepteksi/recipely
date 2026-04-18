import type { RecipeDto } from './recipe-dto';

export interface RecipesListDto {
  recipes: RecipeDto[];
  total: number;
  skip: number;
  limit: number;
}
