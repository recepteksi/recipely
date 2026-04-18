import { Entity } from '@core/entity/entity';
import { fail, ok, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';

export interface RecipeProps {
  id: string;
  name: string;
  cuisine: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  image: string;
  rating: number;
  tags: string[];
  mealType: string[];
  ownerId: string;
}

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
    return ok(new Recipe(props));
  }

  get name(): string {
    return this.props.name;
  }
  get cuisine(): string {
    return this.props.cuisine;
  }
  get difficulty(): string {
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
  get image(): string {
    return this.props.image;
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
}
