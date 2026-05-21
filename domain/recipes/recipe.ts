import { Entity } from '@core/entity/entity';
import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import type { MediaItem } from '@domain/recipes/media-item';
import type { CuisineKey } from '@domain/recipes/cuisine-key';
import type { RecipeCategory } from '@domain/recipes/recipe-category';
import type { Difficulty } from '@domain/recipes/difficulty';

export interface RecipeNutrition {
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface RecipeProps {
  id: string;
  name: string;
  cuisine: CuisineKey;
  category: RecipeCategory;
  difficulty: Difficulty;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  nutrition?: RecipeNutrition;
  image: string;
  media: MediaItem[];
  rating: number;
  tags: string[];
  mealType: string[];
  ownerId: string;
  likeCount: number;
  likedByMe: boolean;
}

/**
 * Domain entity representing a recipe. Validates that `id` and `name` are
 * non-empty before construction; use `Recipe.create` to obtain an instance.
 */
export class Recipe extends Entity<RecipeProps> {
  private constructor(props: RecipeProps) {
    super(props);
  }

  static create(props: RecipeProps): Result<Recipe, ValidationFailure> {
    if (props.id.trim().length === 0) {
      return fail(new ValidationFailure('Recipe id must be non-empty', 'id'));
    }
    if (props.name.trim().length === 0) {
      return fail(new ValidationFailure('Recipe name must be non-empty', 'name'));
    }
    if (props.caloriesPerServing < 0) {
      return fail(new ValidationFailure('Calories must be non-negative', 'caloriesPerServing'));
    }
    if (props.servings < 1) {
      return fail(new ValidationFailure('Servings must be at least 1', 'servings'));
    }
    return ok(new Recipe(props));
  }

  get name(): string {
    return this.props.name;
  }
  get cuisine(): CuisineKey {
    return this.props.cuisine;
  }
  get category(): RecipeCategory {
    return this.props.category;
  }
  get difficulty(): Difficulty {
    return this.props.difficulty;
  }
  get ingredients(): string[] {
    return this.props.ingredients;
  }
  get instructions(): string[] {
    return this.props.instructions;
  }
  get prepTimeMinutes(): number {
    return this.props.prepTimeMinutes;
  }
  get cookTimeMinutes(): number {
    return this.props.cookTimeMinutes;
  }
  get servings(): number {
    return this.props.servings;
  }
  get caloriesPerServing(): number {
    return this.props.caloriesPerServing;
  }
  get nutrition(): RecipeNutrition | undefined {
    return this.props.nutrition;
  }
  get image(): string {
    return this.props.image;
  }
  get media(): MediaItem[] {
    return this.props.media;
  }
  get rating(): number {
    return this.props.rating;
  }
  get tags(): string[] {
    return this.props.tags;
  }
  get mealType(): string[] {
    return this.props.mealType;
  }
  get ownerId(): string {
    return this.props.ownerId;
  }
  get likeCount(): number {
    return this.props.likeCount;
  }
  get likedByMe(): boolean {
    return this.props.likedByMe;
  }
}
