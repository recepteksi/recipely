import type { MediaType } from '@domain/recipes/media-type';

/**
 * A single media file attached to a recipe on create/update. `uri` is either a
 * local file URI (uploaded as multipart) or an already-hosted `https://` URL
 * (kept verbatim on update). The list order is the gallery order; index 0 is
 * the cover.
 */
export interface RecipeMediaUpload {
  uri: string;
  fileName: string;
  mimeType: string;
  type: MediaType;
}
