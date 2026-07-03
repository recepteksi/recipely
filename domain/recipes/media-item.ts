import type { MediaType } from '@domain/recipes/media-type';

export interface MediaItem {
  type: MediaType;
  url: string;
}
