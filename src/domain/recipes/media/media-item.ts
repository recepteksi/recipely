import type { MediaType } from '@domain/recipes/media/media-type';

export interface MediaItem {
  type: MediaType;
  url: string;
}
