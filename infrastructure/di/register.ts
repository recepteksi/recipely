import { type Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import { HttpClient, type HttpClientOptions } from '@infrastructure/network/http-client';
import { SecureTokenStorage } from '@infrastructure/storage/secure-token-storage';
import { AuthRepository } from '@infrastructure/auth/auth-repository';
import { RecipeRepository } from '@infrastructure/recipes/recipe-repository';
import { TaxonomyRepository } from '@infrastructure/recipes/taxonomy-repository';
import { LoadTaxonomyUseCase } from '@application/recipes/load-taxonomy-use-case';
import { RecipeDraftRepository } from '@infrastructure/drafts/recipe-draft-repository';
import { FavoritesRepository } from '@infrastructure/favorites/favorites-repository';
import { AddFavoriteUseCase } from '@application/favorites/add-favorite-use-case';
import { RemoveFavoriteUseCase } from '@application/favorites/remove-favorite-use-case';
import { LoadFavoritesUseCase } from '@application/favorites/load-favorites-use-case';
import { HealthCheckService } from '@infrastructure/network/health-check-service';
import { CommentRepository } from '@infrastructure/comments/comment-repository';
import { LikeRepository } from '@infrastructure/likes/like-repository';
import { LikeRecipeUseCase } from '@application/likes/like-recipe-use-case';
import { UnlikeRecipeUseCase } from '@application/likes/unlike-recipe-use-case';
import { NotificationRepository } from '@infrastructure/notifications/notification-repository';
import { UserProfileRepository } from '@infrastructure/user-profile/user-profile-repository';
import { ListNotificationsUseCase } from '@application/notifications/list-notifications-use-case';
import { MarkAllReadUseCase } from '@application/notifications/mark-all-read-use-case';
import { RegisterDeviceTokenUseCase } from '@application/notifications/register-device-token-use-case';
import { GetUserProfileUseCase } from '@application/user-profile/get-user-profile-use-case';

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
    // WHY: dev-only HTTP traces — strips automatically from release bundles
    // (Metro replaces __DEV__ with false in production). Helps diagnose
    // network errors on real devices without leaking PII to logcat in prod.
    enableLogging: __DEV__,
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

  container.register(TOKENS.TaxonomyRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new TaxonomyRepository(http);
  });

  container.register(TOKENS.LoadTaxonomyUseCase, () => {
    const repo = container.resolve<TaxonomyRepository>(TOKENS.TaxonomyRepository);
    return new LoadTaxonomyUseCase(repo);
  });

  container.register(TOKENS.RecipeDraftRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new RecipeDraftRepository(http);
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

  container.register(TOKENS.LoadFavoritesUseCase, () => {
    const repo = container.resolve<FavoritesRepository>(TOKENS.FavoritesRepository);
    return new LoadFavoritesUseCase(repo);
  });

  container.register(TOKENS.HealthCheckService, () => new HealthCheckService());

  container.register(TOKENS.CommentRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new CommentRepository(http);
  });

  container.register(TOKENS.LikeRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new LikeRepository(http);
  });

  container.register(TOKENS.LikeRecipeUseCase, () => {
    const repo = container.resolve<LikeRepository>(TOKENS.LikeRepository);
    return new LikeRecipeUseCase(repo);
  });

  container.register(TOKENS.UnlikeRecipeUseCase, () => {
    const repo = container.resolve<LikeRepository>(TOKENS.LikeRepository);
    return new UnlikeRecipeUseCase(repo);
  });

  container.register(TOKENS.NotificationRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new NotificationRepository(http);
  });

  container.register(TOKENS.UserProfileRepository, () => {
    const http = container.resolve<HttpClient>(TOKENS.HttpClient);
    return new UserProfileRepository(http);
  });

  container.register(TOKENS.ListNotificationsUseCase, () => {
    const repo = container.resolve<NotificationRepository>(TOKENS.NotificationRepository);
    return new ListNotificationsUseCase(repo);
  });

  container.register(TOKENS.MarkAllReadUseCase, () => {
    const repo = container.resolve<NotificationRepository>(TOKENS.NotificationRepository);
    return new MarkAllReadUseCase(repo);
  });

  container.register(TOKENS.RegisterDeviceTokenUseCase, () => {
    const repo = container.resolve<NotificationRepository>(TOKENS.NotificationRepository);
    return new RegisterDeviceTokenUseCase(repo);
  });

  container.register(TOKENS.GetUserProfileUseCase, () => {
    const repo = container.resolve<UserProfileRepository>(TOKENS.UserProfileRepository);
    return new GetUserProfileUseCase(repo);
  });
};
