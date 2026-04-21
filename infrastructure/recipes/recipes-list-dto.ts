import type { RecipeDto } from './recipe-dto';

// Recipely paged envelope. Replaces DummyJSON's { recipes, total, skip, limit }.
export interface RecipesListDto {
  items: RecipeDto[];
  total: number;
  page: number;
  pageSize: number;
}
