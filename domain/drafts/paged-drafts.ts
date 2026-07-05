import type { RecipeDraft } from '@domain/drafts/recipe-draft';

/** A single page of recipe drafts plus the total count for pagination. */
export interface PagedDrafts {
  items: RecipeDraft[];
  total: number;
  page: number;
  pageSize: number;
}
