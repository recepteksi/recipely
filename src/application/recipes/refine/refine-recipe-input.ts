import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';

export interface RefineRecipeInput {
  currentRecipe: DraftRecipeSnapshot;
  instruction: string;
}
