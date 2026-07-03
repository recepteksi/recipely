import type { TaxonomyItemDto } from '@infrastructure/recipes/taxonomy-item-dto';

/** Response body of `GET /recipes/categories`. */
export interface CategoriesResponseDto {
  categories: TaxonomyItemDto[];
}
