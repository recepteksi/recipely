import type { Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import { HttpClient } from '@infrastructure/network/http-client';
import { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';
import { AuthRepository } from '@infrastructure/auth/auth-repository';
import { RecipeRepository } from '@infrastructure/recipes/recipe-repository';
import { TaskRepository } from '@infrastructure/tasks/task-repository';

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';

export const registerInfrastructure = (container: Container): void => {
  const storage = new SecureTokenStorage();
  container.register(TOKENS.SecureStorage, () => storage);

  container.register(TOKENS.HttpClient, () => {
    return new HttpClient({
      baseUrl: DUMMYJSON_BASE_URL,
      tokenProvider: async () => {
        const result = await storage.loadSession();
        if (!result.ok || result.value === null) {
          return null;
        }
        return result.value.accessToken;
      },
    });
  });

  container.register(TOKENS.AuthRepository, () => {
    return new AuthRepository(storage);
  });

  container.register(TOKENS.RecipeRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new RecipeRepository(http);
  });

  container.register(TOKENS.TaskRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new TaskRepository(http);
  });
};
