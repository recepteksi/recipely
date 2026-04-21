import { type Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import { HttpClient } from '@infrastructure/network/http-client';
import { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';
import { AuthRepository } from '@infrastructure/auth/auth-repository';
import { RecipeRepository } from '@infrastructure/recipes/recipe-repository';
import { TaskRepository } from '@infrastructure/tasks/task-repository';
import { HealthCheckService } from '@infrastructure/network/health-check-service';

import { API_BASE_URL } from '@infrastructure/constants/api';

export const registerInfrastructure = (container: Container): void => {
  const storage = new SecureTokenStorage();
  container.register(TOKENS.SecureStorage, () => storage);

  container.register(TOKENS.HttpClient, () => {
    return new HttpClient({
      baseUrl: API_BASE_URL,
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
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new AuthRepository(http, storage);
  });

  container.register(TOKENS.RecipeRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new RecipeRepository(http);
  });

  container.register(TOKENS.TaskRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new TaskRepository(http);
  });

  container.register(TOKENS.HealthCheckService, () => new HealthCheckService());
};
