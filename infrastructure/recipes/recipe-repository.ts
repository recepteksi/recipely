import { fail, ok, type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { Recipe } from '@domain/recipes/recipe';
import type {
  CreateRecipeInput,
  CreateRecipeProgressCallback,
  IRecipeRepository,
} from '@domain/recipes/i-recipe-repository';
import type { HttpClient } from '@infrastructure/network/http-client';
import { RECIPES_PAGE_SIZE } from '@infrastructure/constants/api';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';
import type { RecipesListDto } from '@infrastructure/recipes/recipes-list-dto';
import { toRecipe } from '@infrastructure/recipes/recipe-mapper';

export class RecipeRepository implements IRecipeRepository {
  constructor(private readonly http: HttpClient) {}

  async listActiveRecipes(): Promise<Result<Recipe[], Failure>> {
    const result = await this.http.request<RecipesListDto>({
      method: 'GET',
      url: '/recipes',
      params: { page: 1, pageSize: RECIPES_PAGE_SIZE },
    });
    if (!result.ok) {
      return result;
    }
    const recipes: Recipe[] = [];
    for (const dto of result.value.items) {
      const mapped = toRecipe(dto);
      if (!mapped.ok) {
        return fail(mapped.failure);
      }
      recipes.push(mapped.value);
    }
    return ok(recipes);
  }

  async getRecipe(id: string): Promise<Result<Recipe, Failure>> {
    const result = await this.http.request<RecipeDto>({
      method: 'GET',
      url: `/recipes/${encodeURIComponent(id)}`,
    });
    if (!result.ok) {
      return result;
    }
    const mapped = toRecipe(result.value);
    if (!mapped.ok) {
      return fail(mapped.failure);
    }
    return ok(mapped.value);
  }

  async createRecipe(
    input: CreateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>> {
    const formData = new FormData();
    // Image as file
    formData.append('image', {
      uri: input.imageUri,
      name: input.imageFileName,
      type: input.imageMimeType,
    } as unknown as Blob);

    // Localized string fields — backend expects JSON-stringified Record<string, string>
    formData.append('name', JSON.stringify(input.name));
    formData.append('cuisine', JSON.stringify(input.cuisine));
    formData.append('difficulty', input.difficulty);
    formData.append('ingredients', JSON.stringify(input.ingredients));
    formData.append('instructions', JSON.stringify(input.instructions));
    formData.append('prepTimeMinutes', String(input.prepTimeMinutes));
    formData.append('cookTimeMinutes', String(input.cookTimeMinutes));

    if (input.rating !== undefined) {
      formData.append('rating', String(input.rating));
    }
    if (input.tags) {
      formData.append('tags', JSON.stringify(input.tags));
    }
    if (input.mealType) {
      formData.append('mealType', JSON.stringify(input.mealType));
    }
    if (input.categoryId !== undefined) {
      formData.append('categoryId', input.categoryId ?? 'null');
    }
    if (input.isPublished !== undefined) {
      formData.append('isPublished', String(input.isPublished));
    }
    if (input.locale) {
      formData.append('locale', input.locale);
    }

    const result = await this.http.uploadMultipart<RecipeDto>(
      '/recipes/with-image',
      formData,
      onProgress
      ? (event) => onProgress(event.loaded ?? 0, event.total ?? 0)
      : undefined,
    );
    if (!result.ok) {
      return result;
    }
    const mapped = toRecipe(result.value);
    if (!mapped.ok) {
      return fail(mapped.failure);
    }
    return ok(mapped.value);
  }
}
