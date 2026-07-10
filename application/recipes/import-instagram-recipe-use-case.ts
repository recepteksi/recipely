import { fail } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import { type Failure, ValidationFailure } from '@core/failure';
import type { Recipe } from '@domain/recipes/recipe';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';

import type { ImportInstagramRecipeInput } from '@application/recipes/import-instagram-recipe-input';

const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com'];

/**
 * Imports an Instagram reel/video into a preview `Recipe`. Two client-side
 * guards short-circuit before the network so a slow (~120s) backend round-trip
 * is never wasted on input that cannot succeed: a blank URL fails as
 * `createRecipe.importInvalidUrl`, and a URL that does not parse or whose host
 * is not Instagram fails as `createRecipe.importNotInstagram`. The returned
 * recipe is a NON-persisted preview (same contract as `generateRecipe`).
 */
export class ImportInstagramRecipeUseCase {
  constructor(private readonly repo: IRecipeRepository) {}

  execute(input: ImportInstagramRecipeInput): Promise<Result<Recipe, Failure>> {
    const trimmed = input.url.trim();
    if (trimmed.length === 0) {
      return Promise.resolve(fail(new ValidationFailure('createRecipe.importInvalidUrl')));
    }
    let host: string;
    try {
      host = new URL(trimmed).hostname;
    } catch {
      return Promise.resolve(fail(new ValidationFailure('createRecipe.importNotInstagram')));
    }
    if (!INSTAGRAM_HOSTS.includes(host.toLowerCase())) {
      return Promise.resolve(fail(new ValidationFailure('createRecipe.importNotInstagram')));
    }
    return this.repo.importInstagramRecipe(trimmed, input.locale);
  }
}
