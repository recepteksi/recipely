import { type Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import { HttpClient, type HttpClientOptions } from '@infrastructure/network/http-client';
import { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';
import { AuthRepository } from '@infrastructure/auth/auth-repository';
import { RecipeRepository } from '@infrastructure/recipes/recipe-repository';
import { FavoritesRepository } from '@infrastructure/favorites/favorites-repository';
import { AddFavoriteUseCase } from '@application/favorites/add-favorite-use-case';
import { RemoveFavoriteUseCase } from '@application/favorites/remove-favorite-use-case';
import { TaskRepository } from '@infrastructure/tasks/task-repository';
import { HealthCheckService } from '@infrastructure/network/health-check-service';

import { API_BASE_URL } from '@infrastructure/constants/api';

export interface InfrastructureOptions {
  localeProvider?: () => string;
}

export const registerInfrastructure = (container: Container, opts?: InfrastructureOptions): void => {
  const storage = new SecureTokenStorage();
  container.register(TOKENS.SecureStorage, () => storage);

  const httpClientOptions: HttpClientOptions = {
    baseUrl: API_BASE_URL,
    tokenProvider: async () => {
      const result = await storage.loadSession();
      if (!result.ok || result.value === null) {
        return null;
      }
      return result.value.accessToken;
    },
  };
  if (opts?.localeProvider) {
    httpClientOptions.localeProvider = opts.localeProvider;
  }
  container.register(TOKENS.HttpClient, () => new HttpClient(httpClientOptions));

  container.register(TOKENS.AuthRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new AuthRepository(http, storage);
  });

  container.register(TOKENS.RecipeRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new RecipeRepository(http);
  });

  container.register(TOKENS.FavoritesRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new FavoritesRepository(http);
  });

  container.register(TOKENS.AddFavoriteUseCase, () => {
    const repo = container.resolve<FavoritesRepository>(TOKENS.FavoritesRepository);
    return new AddFavoriteUseCase(repo);
  });

  container.register(TOKENS.RemoveFavoriteUseCase, () => {
    const repo = container.resolve<FavoritesRepository>(TOKENS.FavoritesRepository);
    return new RemoveFavoriteUseCase(repo);
  });

  container.register(TOKENS.TaskRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new TaskRepository(http);
  });

  container.register(TOKENS.HealthCheckService, () => new HealthCheckService());
};
