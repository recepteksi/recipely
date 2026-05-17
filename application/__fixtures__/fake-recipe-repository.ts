import { type Failure, UnknownFailure } from '@core/failure';
import { fail, ok, type Result } from '@core/result/result';
import type {
  CreateRecipeInput,
  CreateRecipeProgressCallback,
  IRecipeRepository,
  UpdateRecipeInput,
} from '@domain/recipes/i-recipe-repository';
import type { Recipe } from '@domain/recipes/recipe';

export interface FakeRecipeRepositoryConfig {
  listActiveRecipesResult?: Result<Recipe[], Failure>;
  listMyRecipesResult?: Result<Recipe[], Failure>;
  getRecipeResult?: Result<Recipe, Failure>;
  createRecipeResult?: Result<Recipe, Failure>;
  generateRecipeResult?: Result<Recipe, Failure>;
  updateRecipeResult?: Result<Recipe, Failure>;
  deleteRecipeResult?: Result<void, Failure>;
}

export interface GenerateRecipeCall {
  prompt: string;
  locale: string;
}

export class FakeRecipeRepository implements IRecipeRepository {
  // Public so tests can assert on the last call without a getter ceremony.
  lastGenerateCall: GenerateRecipeCall | null = null;
  generateCallCount = 0;

  constructor(private readonly config: FakeRecipeRepositoryConfig = {}) {}

  listActiveRecipes(): Promise<Result<Recipe[], Failure>> {
    return Promise.resolve(
      this.config.listActiveRecipesResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  listMyRecipes(): Promise<Result<Recipe[], Failure>> {
    return Promise.resolve(
      this.config.listMyRecipesResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  getRecipe(_id: string): Promise<Result<Recipe, Failure>> {
    return Promise.resolve(
      this.config.getRecipeResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  createRecipe(
    _input: CreateRecipeInput,
    _onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>> {
    return Promise.resolve(
      this.config.createRecipeResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  generateRecipe(prompt: string, locale: string): Promise<Result<Recipe, Failure>> {
    this.lastGenerateCall = { prompt, locale };
    this.generateCallCount += 1;
    return Promise.resolve(
      this.config.generateRecipeResult ?? ok(undefined as unknown as Recipe),
    );
  }

  updateRecipe(
    _id: string,
    _input: UpdateRecipeInput,
    _onProgress?: CreateRecipeProgressCallback,
  ): Promise<Result<Recipe, Failure>> {
    return Promise.resolve(
      this.config.updateRecipeResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  deleteRecipe(_id: string): Promise<Result<void, Failure>> {
    return Promise.resolve(
      this.config.deleteRecipeResult ?? ok(undefined as void),
    );
  }
}
