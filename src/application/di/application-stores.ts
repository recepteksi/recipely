import type { AuthStore } from '@application/auth/auth-store';
import type { RecipeListStore } from '@application/recipes/recipe-list-store';
import type { TrendingRecipesStore } from '@application/recipes/trending-recipes-store';
import type { RecipeDetailStore } from '@application/recipes/recipe-detail-store';
import type { SavedRecipesStore } from '@application/recipes/saved-recipes-store';
import type { CreatedRecipesStore } from '@application/recipes/created-recipes-store';
import type { DraftsStore } from '@application/drafts/drafts-store';
import type { FavoritesStore } from '@application/favorites/favorites-store';
import type { CommentsStore } from '@application/comments/comments-store';
import type { LikesStore } from '@application/likes/likes-store';
import type { NotificationsStore } from '@application/notifications/notifications-store';
import type { UserProfileStore } from '@application/user-profile/user-profile-store';
import type { TaxonomyStore } from '@application/recipes/taxonomy-store';
import type { FeedbackStore } from '@application/feedback/feedback-store';
import type { LoadFavoritesUseCase } from '@application/favorites/load-favorites-use-case';

/** The store bundle `registerApplication` hands to the presentation layer. */
export interface ApplicationStores {
  authStore: AuthStore;
  recipeListStore: RecipeListStore;
  trendingRecipesStore: TrendingRecipesStore;
  recipeDetailStore: RecipeDetailStore;
  savedRecipesStore: SavedRecipesStore;
  createdRecipesStore: CreatedRecipesStore;
  draftsStore: DraftsStore;
  favoritesStore: FavoritesStore;
  commentsStore: CommentsStore;
  likesStore: LikesStore;
  notificationsStore: NotificationsStore;
  userProfileStore: UserProfileStore;
  taxonomyStore: TaxonomyStore;
  feedbackStore: FeedbackStore;
  loadFavoritesUseCase: LoadFavoritesUseCase;
}
