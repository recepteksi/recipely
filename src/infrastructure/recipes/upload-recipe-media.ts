import { ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { RecipeMediaUpload } from '@domain/recipes/recipe-media-upload';
import type { CreateRecipeProgressCallback } from '@domain/recipes/create-recipe-progress-callback';
import type { HttpClient } from '@infrastructure/network/http-client';
import { appendFilePart } from '@infrastructure/network/append-file-part';
import { UPLOAD_URL } from '@infrastructure/constants/api';
import type { ResolvedRecipeMedia } from '@infrastructure/recipes/resolved-recipe-media';

/**
 * Resolves an ordered media gallery to hosted `{ type, url }` entries for
 * `PATCH /recipes/:id`. Local URIs are uploaded via `POST /upload` (server
 * root, outside `/api/v1`) and replaced with their hosted URL; already-hosted
 * `https://` URLs are passed through untouched so unchanged photos are never
 * re-uploaded. Fails with the first upload failure.
 */
export const uploadRecipeMedia = async (
  http: HttpClient,
  media: RecipeMediaUpload[],
  onProgress?: CreateRecipeProgressCallback,
): Promise<Result<ResolvedRecipeMedia[], Failure>> => {
  const gallery: ResolvedRecipeMedia[] = [];
  for (const item of media) {
    let url = item.uri;
    if (!item.uri.startsWith('http')) {
      const formData = new FormData();
      await appendFilePart(formData, 'image', {
        uri: item.uri,
        fileName: item.fileName,
        mimeType: item.mimeType,
      });
      const uploadResult = await http.uploadMultipart<{ url: string; filename: string }>(
        UPLOAD_URL,
        formData,
        onProgress ? (event) => onProgress(event.loaded, event.total) : undefined,
      );
      if (!uploadResult.ok) return uploadResult;
      url = uploadResult.value.url;
    }
    gallery.push({ type: item.type, url });
  }
  return ok(gallery);
};
