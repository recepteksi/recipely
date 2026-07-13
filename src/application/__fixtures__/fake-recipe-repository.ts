import { type Failure, UnknownFailure } from '@core/failure';
import { fail, ok } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { CreateRecipeInput } from '@domain/recipes/create-recipe-input';
import type { CreateRecipeProgressCallback } from '@domain/recipes/create-recipe-progress-callback';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';
import type { UpdateRecipeInput } from '@domain/recipes/update-recipe-input';
import type { Recipe } from '@domain/recipes/recipe';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import type { DraftRecipeSnapshot } from '@domain/drafts/draft-recipe-snapshot';
import type { FakeRecipeRepositoryConfig } from '@application/__fixtures__/fake-recipe-repository-config';
import type { GenerateRecipeCall } from '@application/__fixtures__/generate-recipe-call';
import type { ImportInstagramRecipeCall } from '@application/__fixtures__/import-instagram-recipe-call';
import type { RefineRecipeCall } from '@application/__fixtures__/refine-recipe-call';

/**
 * In-memory test double for `IRecipeRepository`. Returns pre-configured
 * `Result` values for each operation. The `generateRecipe` method additionally
 * records call arguments in `lastGenerateCall` and increments `generateCallCount`
 * so tests can assert on invocation details without a spy framework.
 */
export class FakeRecipeRepository implements IRecipeRepository {
  // Public so tests can assert on the last call without a getter ceremony.
  lastGenerateCall: GenerateRecipeCall | null = null;
  generateCallCount = 0;
  lastImportInstagramCall: ImportInstagramRecipeCall | null = null;
  importInstagramCallCount = 0;
  lastRefineCall: RefineRecipeCall | null = null;
  refineCallCount = 0;

  constructor(private readonly config: FakeRecipeRepositoryConfig = {}) {}

  listActiveRecipes(_filters?: RecipeFilters): Promise<Result<RecipeSummary[], Failure>> {
    return Promise.resolve(
      this.config.listActiveRecipesResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  listTrendingRecipes(_limit?: number): Promise<Result<RecipeSummary[], Failure>> {
    return Promise.resolve(
      this.config.listTrendingRecipesResult ?? fail(new UnknownFailure('not configured')),
    );
  }

  listMyRecipes(): Promise<Result<RecipeSummary[], Failure>> {
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

  generateRecipe(prompt: string): Promise<Result<Recipe, Failure>> {
    this.lastGenerateCall = { prompt };
    this.generateCallCount += 1;
    return Promise.resolve(
      this.config.generateRecipeResult ?? ok(undefined as unknown as Recipe),
    );
  }

  importInstagramRecipe(url: string): Promise<Result<Recipe, Failure>> {
    this.lastImportInstagramCall = { url };
    this.importInstagramCallCount += 1;
    return Promise.resolve(
      this.config.importInstagramRecipeResult ?? ok(undefined as unknown as Recipe),
    );
  }

  refineRecipe(
    currentRecipe: DraftRecipeSnapshot,
    instruction: string,
  ): Promise<Result<Recipe, Failure>> {
    this.lastRefineCall = { currentRecipe, instruction };
    this.refineCallCount += 1;
    return Promise.resolve(
      this.config.refineRecipeResult ?? ok(undefined as unknown as Recipe),
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
