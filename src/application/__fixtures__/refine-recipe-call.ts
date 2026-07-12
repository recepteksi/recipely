import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';

export interface RefineRecipeCall {
  currentRecipe: DraftRecipeSnapshot;
  instruction: string;
}
