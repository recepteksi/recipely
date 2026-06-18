// Wire shape returned by the Recipely backend for a single taxonomy entry.
// Shared by the cuisines and categories catalog endpoints. Keep in sync with
// recipely-backend `application/recipes/dtos` taxonomy DTOs.
export interface TaxonomyItemDto {
  key: string;
  name: string;
  emoji: string;
}

/** Response body of `GET /recipes/cuisines`. */
export interface CuisinesResponseDto {
  cuisines: TaxonomyItemDto[];
}

/** Response body of `GET /recipes/categories`. */
export interface CategoriesResponseDto {
  categories: TaxonomyItemDto[];
}
