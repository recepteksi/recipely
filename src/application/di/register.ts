import type { Container } from '@core/di/container';
import { TOKENS } from '@core/di/tokens';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';
import type { IRecipeRepository } from '@domain/recipes/i-recipe-repository';
import type { IRecipeDraftRepository } from '@domain/drafts/i-recipe-draft-repository';
import { SignInUseCase } from '@application/auth/sign-in-use-case';
import { RequestRegistrationUseCase } from '@application/auth/request-registration-use-case';
import { VerifyRegistrationUseCase } from '@application/auth/verify-registration-use-case';
import { ResendRegistrationCodeUseCase } from '@application/auth/resend-registration-code-use-case';
import { SignOutUseCase } from '@application/auth/sign-out-use-case';
import { GetSessionUseCase } from '@application/auth/get-session-use-case';
import { SignInWithGoogleUseCase } from '@application/auth/sign-in-with-google-use-case';
import { SignInWithAppleUseCase } from '@application/auth/sign-in-with-apple-use-case';
import { RequestPasswordResetUseCase } from '@application/auth/request-password-reset-use-case';
import { ResetPasswordUseCase } from '@application/auth/reset-password-use-case';
import { UploadAvatarUseCase } from '@application/auth/upload-avatar-use-case';
import { UpdateProfileUseCase } from '@application/auth/update-profile-use-case';
import { DeleteAccountUseCase } from '@application/auth/delete-account-use-case';
import { ListRecipesUseCase } from '@application/recipes/list-recipes-use-case';
import { ListTrendingRecipesUseCase } from '@application/recipes/list-trending-recipes-use-case';
import { GetRecipeUseCase } from '@application/recipes/get-recipe-use-case';
import { CreateRecipeUseCase } from '@application/recipes/create-recipe-use-case';
import { ListMyRecipesUseCase } from '@application/recipes/list-my-recipes-use-case';
import { GenerateRecipeUseCase } from '@application/recipes/generate-recipe-use-case';
import { ImportInstagramRecipeUseCase } from '@application/recipes/import-instagram-recipe-use-case';
import { RefineRecipeUseCase } from '@application/recipes/refine-recipe-use-case';
import { ListDraftsUseCase } from '@application/drafts/list-drafts-use-case';
import { GetLatestDraftUseCase } from '@application/drafts/get-latest-draft-use-case';
import { GetDraftUseCase } from '@application/drafts/get-draft-use-case';
import { UpsertDraftUseCase } from '@application/drafts/upsert-draft-use-case';
import { DeleteDraftUseCase } from '@application/drafts/delete-draft-use-case';
import { configureDraftsStore } from '@application/drafts/configure-drafts-store';
import { UpdateRecipeUseCase } from '@application/recipes/update-recipe-use-case';
import { DeleteRecipeUseCase } from '@application/recipes/delete-recipe-use-case';
import { AddFavoriteUseCase } from '@application/favorites/add-favorite-use-case';
import { RemoveFavoriteUseCase } from '@application/favorites/remove-favorite-use-case';
import { LoadFavoritesUseCase } from '@application/favorites/load-favorites-use-case';
import { configureAuthStore } from '@application/auth/configure-auth-store';
import { configureRecipeListStore } from '@application/recipes/configure-recipe-list-store';
import { configureTrendingRecipesStore } from '@application/recipes/configure-trending-recipes-store';
import { configureRecipeDetailStore } from '@application/recipes/configure-recipe-detail-store';
import { configureSavedRecipesStore } from '@application/recipes/configure-saved-recipes-store';
import { configureCreatedRecipesStore } from '@application/recipes/configure-created-recipes-store';
import { LoadTaxonomyUseCase } from '@application/recipes/load-taxonomy-use-case';
import { configureTaxonomyStore } from '@application/recipes/configure-taxonomy-store';
import { configureFavoritesStore } from '@application/favorites/configure-favorites-store';
import { ListCommentsUseCase } from '@application/comments/list-comments-use-case';
import { AddCommentUseCase } from '@application/comments/add-comment-use-case';
import { DeleteCommentUseCase } from '@application/comments/delete-comment-use-case';
import { LikeCommentUseCase } from '@application/comments/like-comment-use-case';
import { UnlikeCommentUseCase } from '@application/comments/unlike-comment-use-case';
import { configureCommentsStore } from '@application/comments/configure-comments-store';
import type { ICommentRepository } from '@domain/comments/i-comment-repository';
import { LikeRecipeUseCase } from '@application/likes/like-recipe-use-case';
import { UnlikeRecipeUseCase } from '@application/likes/unlike-recipe-use-case';
import { configureLikesStore } from '@application/likes/configure-likes-store';
import { ListNotificationsUseCase } from '@application/notifications/list-notifications-use-case';
import { MarkAllReadUseCase } from '@application/notifications/mark-all-read-use-case';
import { configureNotificationsStore } from '@application/notifications/configure-notifications-store';
import { GetUserProfileUseCase } from '@application/user-profile/get-user-profile-use-case';
import { configureUserProfileStore } from '@application/user-profile/configure-user-profile-store';
import { SubmitFeedbackUseCase } from '@application/feedback/submit-feedback-use-case';
import { configureFeedbackStore } from '@application/feedback/configure-feedback-store';
import type { ApplicationStores } from '@application/di/application-stores';


export const registerApplication = (container: Container): ApplicationStores => {
  const authRepo = container.resolve<IAuthRepository>(TOKENS.AuthRepository);
  const recipeRepo = container.resolve<IRecipeRepository>(TOKENS.RecipeRepository);
  const draftRepo = container.resolve<IRecipeDraftRepository>(TOKENS.RecipeDraftRepository);
  const signIn = new SignInUseCase(authRepo);
  const requestRegistration = new RequestRegistrationUseCase(authRepo);
  const verifyRegistration = new VerifyRegistrationUseCase(authRepo);
  const resendRegistrationCode = new ResendRegistrationCodeUseCase(authRepo);
  const signOut = new SignOutUseCase(authRepo);
  const getSession = new GetSessionUseCase(authRepo);
  const signInWithGoogle = new SignInWithGoogleUseCase(authRepo);
  const signInWithApple = new SignInWithAppleUseCase(authRepo);
  const requestPasswordReset = new RequestPasswordResetUseCase(authRepo);
  const resetPassword = new ResetPasswordUseCase(authRepo);
  const uploadAvatar = new UploadAvatarUseCase(authRepo);
  const updateProfile = new UpdateProfileUseCase(authRepo);
  const deleteAccount = new DeleteAccountUseCase(authRepo);
  const listRecipes = new ListRecipesUseCase(recipeRepo);
  const listTrendingRecipes = new ListTrendingRecipesUseCase(recipeRepo);
  const getRecipe = new GetRecipeUseCase(recipeRepo);
  const createRecipeUseCase = new CreateRecipeUseCase(recipeRepo);
  const listMyRecipesUseCase = new ListMyRecipesUseCase(recipeRepo);
  const generateRecipeUseCase = new GenerateRecipeUseCase(recipeRepo);
  const importInstagramRecipeUseCase = new ImportInstagramRecipeUseCase(recipeRepo);
  const refineRecipeUseCase = new RefineRecipeUseCase(recipeRepo);
  const updateRecipeUseCase = new UpdateRecipeUseCase(recipeRepo);
  const deleteRecipeUseCase = new DeleteRecipeUseCase(recipeRepo);
  const listDraftsUseCase = new ListDraftsUseCase(draftRepo);
  const getLatestDraftUseCase = new GetLatestDraftUseCase(draftRepo);
  const getDraftUseCase = new GetDraftUseCase(draftRepo);
  const upsertDraftUseCase = new UpsertDraftUseCase(draftRepo);
  const deleteDraftUseCase = new DeleteDraftUseCase(draftRepo);
  const commentRepo = container.resolve<ICommentRepository>(TOKENS.CommentRepository);
  const listCommentsUseCase = new ListCommentsUseCase(commentRepo);
  const addCommentUseCase = new AddCommentUseCase(commentRepo);
  const deleteCommentUseCase = new DeleteCommentUseCase(commentRepo);
  const likeCommentUseCase = new LikeCommentUseCase(commentRepo);
  const unlikeCommentUseCase = new UnlikeCommentUseCase(commentRepo);

  const addFavoriteUseCase = container.resolve<AddFavoriteUseCase>(TOKENS.AddFavoriteUseCase);
  const removeFavoriteUseCase = container.resolve<RemoveFavoriteUseCase>(TOKENS.RemoveFavoriteUseCase);
  const loadFavoritesUseCase = container.resolve<LoadFavoritesUseCase>(TOKENS.LoadFavoritesUseCase);
  const likeRecipeUseCase = container.resolve<LikeRecipeUseCase>(TOKENS.LikeRecipeUseCase);
  const unlikeRecipeUseCase = container.resolve<UnlikeRecipeUseCase>(TOKENS.UnlikeRecipeUseCase);

  const savedRecipesStore = configureSavedRecipesStore();
  const recipeListStore = configureRecipeListStore({ listRecipes });
  const trendingRecipesStore = configureTrendingRecipesStore({ listTrendingRecipes });
  const recipeDetailStore = configureRecipeDetailStore({ getRecipe });
  const favoritesStore = configureFavoritesStore({
    addFavoriteUseCase,
    removeFavoriteUseCase,
    savedRecipesStore,
  });
  const createdRecipesStore = configureCreatedRecipesStore({
    createRecipeUseCase,
    listMyRecipesUseCase,
    generateRecipeUseCase,
    importInstagramRecipeUseCase,
    refineRecipeUseCase,
    updateRecipeUseCase,
    deleteRecipeUseCase,
    recipeListStore,
    recipeDetailStore,
  });
  const draftsStore = configureDraftsStore({
    listDraftsUseCase,
    getLatestDraftUseCase,
    getDraftUseCase,
    upsertDraftUseCase,
    deleteDraftUseCase,
  });
  const commentsStore = configureCommentsStore({
    listComments: listCommentsUseCase,
    addComment: addCommentUseCase,
    deleteComment: deleteCommentUseCase,
    likeComment: likeCommentUseCase,
    unlikeComment: unlikeCommentUseCase,
  });
  const likesStore = configureLikesStore({
    likeRecipe: likeRecipeUseCase,
    unlikeRecipe: unlikeRecipeUseCase,
  });
  const listNotificationsUseCase = container.resolve<ListNotificationsUseCase>(
    TOKENS.ListNotificationsUseCase,
  );
  const markAllReadUseCase = container.resolve<MarkAllReadUseCase>(
    TOKENS.MarkAllReadUseCase,
  );
  const notificationsStore = configureNotificationsStore({
    listNotifications: listNotificationsUseCase,
    markAllRead: markAllReadUseCase,
  });
  const getUserProfileUseCase = container.resolve<GetUserProfileUseCase>(
    TOKENS.GetUserProfileUseCase,
  );
  const userProfileStore = configureUserProfileStore({
    getUserProfile: getUserProfileUseCase,
  });
  const loadTaxonomyUseCase = container.resolve<LoadTaxonomyUseCase>(
    TOKENS.LoadTaxonomyUseCase,
  );
  const taxonomyStore = configureTaxonomyStore({ loadTaxonomyUseCase });
  const submitFeedbackUseCase = container.resolve<SubmitFeedbackUseCase>(
    TOKENS.SubmitFeedbackUseCase,
  );
  const feedbackStore = configureFeedbackStore({ submitFeedbackUseCase });
  // WHY: built after every session-scoped store exists so sign-out / account
  // deletion / session expiry can wipe all of them in one place — a cache that
  // survives an account switch shows the previous user's data (stale comments,
  // likes, notifications) until a manual refresh.
  const clearSessionCaches = (): void => {
    savedRecipesStore.getState().setSavedIds(new Set());
    commentsStore.getState().clear();
    likesStore.getState().clear();
    recipeDetailStore.getState().clear();
    notificationsStore.getState().clear();
    createdRecipesStore.getState().clear();
    userProfileStore.getState().reset();
  };
  const authStore = configureAuthStore({ signIn, requestRegistration, verifyRegistration, resendRegistrationCode, signOut, getSession, loadFavorites: loadFavoritesUseCase, savedRecipesStore, signInWithGoogle, signInWithApple, requestPasswordReset, resetPassword, uploadAvatar, updateProfile, deleteAccount, clearSessionCaches });
  return {
    authStore,
    recipeListStore,
    trendingRecipesStore,
    recipeDetailStore,
    savedRecipesStore,
    createdRecipesStore,
    draftsStore,
    favoritesStore,
    commentsStore,
    likesStore,
    notificationsStore,
    userProfileStore,
    taxonomyStore,
    feedbackStore,
    loadFavoritesUseCase,
  };
};
