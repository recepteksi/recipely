import { type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Recipe } from '@domain/recipes/recipe';
import type { MediaItem } from '@domain/recipes/media-item';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';

// WHY: domain's Recipe uses a plain string for difficulty; no need to promote the
// backend's string-union into a domain enum just to swap a remote.
export const toRecipe = (dto: RecipeDto): Result<Recipe, ValidationFailure> => {
  // Backend doesn't send a media[] yet; promote the cover `image` into a
  // single-item media gallery so the UI's MediaGallery widget always has
  // something to render. When the backend ships explicit media, swap this for
  // a passthrough on dto.media (and keep the fallback for legacy rows).
  const media: MediaItem[] = [{ type: 'image', url: dto.image }];

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
    media,
    rating: dto.rating,
    tags: dto.tags,
    mealType: dto.mealType,
    ownerId: dto.ownerId,
  });
};
