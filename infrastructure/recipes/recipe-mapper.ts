import { type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Recipe } from '@domain/recipes/recipe';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';

// WHY: domain's Recipe uses a plain string for difficulty; no need to promote the
// backend's string-union into a domain enum just to swap a remote.
export const toRecipe = (dto: RecipeDto): Result<Recipe, ValidationFailure> => {
  return Recipe.create({
    id: dto.id,
    name: dto.name,
    cuisine: dto.cuisine,
    difficulty: dto.difficulty,
    ingredients: dto.ingredients,
    instructions: dto.instructions,
    prepTimeMinutes: dto.prepTimeMinutes,
    cookTimeMinutes: dto.cookTimeMinutes,
    image: dto.image,
    rating: dto.rating,
    tags: dto.tags,
    mealType: dto.mealType,
    ownerId: dto.ownerId,
  });
};
