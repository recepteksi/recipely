import { type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Recipe } from '@domain/recipes/recipe';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';

export const toRecipe = (dto: RecipeDto): Result<Recipe, ValidationFailure> => {
  return Recipe.create({
    id: String(dto.id),
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
    ownerId: String(dto.userId),
  });
};
