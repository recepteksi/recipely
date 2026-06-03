/**
 * A partial, transient snapshot of the recipe a user is shaping inside the
 * AI create flow. Every field is optional because a draft can be saved at any
 * stage of completion. The wire shape mirrors the backend
 * `DraftRecipeSnapshot` exactly.
 */
export interface DraftRecipeSnapshot {
  name?: string;
  cuisine?: string;
  difficulty?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients?: string[];
  instructions?: string[];
  media?: { type: string; url: string }[];
}
