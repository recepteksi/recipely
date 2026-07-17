import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IFavoritesRepository } from '@domain/favorites/i-favorites-repository';

/**
 * Loads the complete set of recipe IDs that the current user has favorited.
 */
export class LoadFavoritesUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  execute(): Promise<Result<Set<string>, Failure>> {
    return this.repo.getFavoritesIds();
  }
}
