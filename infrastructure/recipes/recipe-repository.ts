import { Platform } from 'react-native';
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

  async listMyRecipes(): Promise<Result<Recipe[], Failure>> {
    const result = await this.http.request<RecipesListDto>({
      method: 'GET',
      url: '/me/recipes',
      params: { page: 1, pageSize: 20 },
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
    // WHY: RN native FormData recognises { uri, name, type } as a file upload;
    // browser FormData does not — it serialises the object to "[object Object]"
    // and multer never sees a file part. On web, fetch the blob URI first.
    if (Platform.OS === 'web') {
      const resp = await fetch(input.imageUri);
      const blob = await resp.blob();
      const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      formData.append('image', blob, `recipe-${Date.now()}.${ext}`);
    } else {
      formData.append('image', {
        uri: input.imageUri,
        name: input.imageFileName,
        type: input.imageMimeType,
      } as unknown as Blob);
    }

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
    // Only send mealType when at least one locale has a non-empty list; an
    // all-empty mealType is meaningless and wastes bytes.
    if (
      input.mealType &&
      Object.values(input.mealType).some((arr) => arr.length > 0)
    ) {
      formData.append('mealType', JSON.stringify(input.mealType));
    }
    // Only send categoryId when it is an actual UUID string — null means
    // "no category" which is the backend default, and the string literal
    // 'null' would fail z.string().uuid() validation.
    if (typeof input.categoryId === 'string') {
      formData.append('categoryId', input.categoryId);
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
