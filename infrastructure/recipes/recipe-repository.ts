import { Platform } from 'react-native';
import { fail, ok, type Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import { Recipe } from '@domain/recipes/recipe';
import type {
  CreateRecipeInput,
  CreateRecipeProgressCallback,
  IRecipeRepository,
  RecipeFilters,
  RecipeMediaUpload,
  UpdateRecipeInput,
} from '@domain/recipes/i-recipe-repository';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { HttpClient } from '@infrastructure/network/http-client';
import { RECIPES_PAGE_SIZE, UPLOAD_URL } from '@infrastructure/constants/api';
import type { RecipeDto } from '@infrastructure/recipes/recipe-dto';
import type { RecipesListDto } from '@infrastructure/recipes/recipes-list-dto';
import { toRecipe } from '@infrastructure/recipes/recipe-mapper';

/**
 * Implements `IRecipeRepository` against the Recipely backend. Handles
 * listing, fetching, creating, updating, deleting, and AI-generating recipes
 * via HTTP. Image uploads are handled as multipart form-data with
 * platform-specific blob construction for web vs. native.
 */
export class RecipeRepository implements IRecipeRepository {
  constructor(private readonly http: HttpClient) {}

  async listActiveRecipes(filters?: RecipeFilters): Promise<Result<Recipe[], Failure>> {
    const params: Record<string, unknown> = { page: 1, pageSize: RECIPES_PAGE_SIZE };
    if (filters?.search) params['search'] = filters.search;
    if (filters?.cuisines?.length) params['cuisines'] = filters.cuisines.join(',');
    if (filters?.categories?.length) params['categories'] = filters.categories.join(',');
    if (filters?.difficulties?.length) params['difficulties'] = filters.difficulties.join(',');
    if (filters?.maxTime) params['maxTime'] = filters.maxTime;
    if (filters?.sort) params['sort'] = filters.sort;
    if (filters?.sortOrder) params['sortOrder'] = filters.sortOrder;

    const result = await this.http.request<RecipesListDto>({
      method: 'GET',
      url: '/recipes',
      params,
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
    // The backend /recipes/with-media route reads every file under the `media`
    // field (Multer .array('media', 10)) in order, promotes the first image to
    // the cover `image`, and persists the rest as the gallery.
    for (const item of input.media) {
      await appendFile(formData, 'media', item);
    }

    formData.append('name', JSON.stringify(input.name));
    formData.append('cuisine', input.cuisine);
    formData.append('category', input.category);
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
    if (
      input.mealType &&
      Object.values(input.mealType).some((arr) => arr.length > 0)
    ) {
      formData.append('mealType', JSON.stringify(input.mealType));
    }
    if (input.isPublished !== undefined) {
      formData.append('isPublished', String(input.isPublished));
    }

    const result = await this.http.uploadMultipart<RecipeDto>(
      '/recipes/with-media',
      formData,
      onProgress ? (event) => onProgress(event.loaded, event.total) : undefined,
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

  async updateRecipe(
    id: string,
    input: UpdateRecipeInput,
    onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body['name'] = input.name;
    if (input.cuisine !== undefined) body['cuisine'] = input.cuisine;
    if (input.category !== undefined) body['category'] = input.category;
    if (input.difficulty !== undefined) body['difficulty'] = input.difficulty;
    if (input.ingredients !== undefined) body['ingredients'] = input.ingredients;
    if (input.instructions !== undefined) body['instructions'] = input.instructions;
    if (input.prepTimeMinutes !== undefined) body['prepTimeMinutes'] = input.prepTimeMinutes;
    if (input.cookTimeMinutes !== undefined) body['cookTimeMinutes'] = input.cookTimeMinutes;
    if (input.servings !== undefined) body['servings'] = input.servings;
    if (input.rating !== undefined) body['rating'] = input.rating;
    if (input.tags !== undefined) body['tags'] = input.tags;
    if (
      input.mealType !== undefined &&
      Object.values(input.mealType).some((arr) => arr.length > 0)
    ) {
      body['mealType'] = input.mealType;
    }
    if (input.isPublished !== undefined) body['isPublished'] = input.isPublished;
    if (input.locale !== undefined) body['locale'] = input.locale;

    // WHY: the backend PATCH /:id accepts a full `media[]` of { type, url } and
    // replaces the gallery. Local URIs must first be turned into hosted URLs via
    // POST /upload (server root, outside /api/v1); already-hosted https URLs are
    // sent verbatim so unchanged photos are never re-uploaded. The first image
    // is also mirrored to `image` to keep the cover in sync.
    if (input.media !== undefined) {
      const gallery: { type: string; url: string }[] = [];
      for (const item of input.media) {
        let url = item.uri;
        if (!item.uri.startsWith('http')) {
          const formData = new FormData();
          await appendFile(formData, 'image', item);
          const uploadResult = await this.http.uploadMultipart<{ url: string; filename: string }>(
            UPLOAD_URL,
            formData,
            onProgress ? (event) => onProgress(event.loaded, event.total) : undefined,
          );
          if (!uploadResult.ok) return uploadResult;
          url = uploadResult.value.url;
        }
        gallery.push({ type: item.type, url });
      }
      body['media'] = gallery;
      const cover = gallery.find((m) => m.type === 'image');
      if (cover !== undefined) body['image'] = cover.url;
    }

    const result = await this.http.request<RecipeDto>({
      method: 'PATCH',
      url: `/recipes/${encodeURIComponent(id)}`,
      data: body,
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

  async deleteRecipe(id: string): Promise<Result<void, Failure>> {
    const result = await this.http.request<unknown>({
      method: 'DELETE',
      url: `/recipes/${encodeURIComponent(id)}`,
    });
    if (!result.ok) {
      return result;
    }
    return ok(undefined);
  }

  // WHY: locale is intentionally not in the body — HttpClient already attaches
  // the `Accept-Language` header via its localeProvider, and the backend reads
  // `req.locale` from that header. Keeping it off the wire avoids two sources of
  // truth for the request locale.
  async generateRecipe(
    prompt: string,
    _locale: string,
  ): Promise<Result<Recipe, Failure>> {
    const result = await this.http.request<RecipeDto>({
      method: 'POST',
      url: '/recipes/generate',
      data: { prompt },
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

  // WHY: like generateRecipe, refine returns a NOT-persisted preview Recipe and
  // the locale rides Accept-Language (kept off the body to avoid two sources of
  // truth). The current in-progress recipe is sent as a DraftRecipeSnapshot.
  async refineRecipe(
    currentRecipe: DraftRecipeSnapshot,
    instruction: string,
  ): Promise<Result<Recipe, Failure>> {
    const result = await this.http.request<RecipeDto>({
      method: 'POST',
      url: '/recipes/refine',
      data: { currentRecipe, instruction },
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
}

/**
 * Appends one media file to a `FormData` under `field`.
 *
 * WHY: RN native FormData recognises `{ uri, name, type }` as a file part;
 * browser FormData does not — it serialises the object to "[object Object]"
 * and Multer never sees a file. On web we therefore fetch the local blob URI
 * first and append the real Blob.
 */
async function appendFile(
  formData: FormData,
  field: string,
  item: RecipeMediaUpload,
): Promise<void> {
  if (Platform.OS === 'web') {
    const resp = await fetch(item.uri);
    const blob = await resp.blob();
    formData.append(field, blob, item.fileName);
  } else {
    formData.append(field, {
      uri: item.uri,
      name: item.fileName,
      type: item.mimeType,
    } as unknown as Blob);
  }
}
