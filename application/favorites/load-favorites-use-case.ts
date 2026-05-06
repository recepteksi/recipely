import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { IFavoritesRepository } from '@domain/favorites/i-favorites-repository';

/**
 * Use case for loading the current user's favorite recipe IDs.
 */
export class LoadFavoritesUseCase {
  constructor(private readonly repo: IFavoritesRepository) {}

  execute(): Promise<Result<Set<string>, Failure>> {
    return this.repo.getFavoritesIds();
  }
}
