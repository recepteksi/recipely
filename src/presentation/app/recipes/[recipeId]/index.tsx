import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/layout/keyboard-avoider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Href, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/use-stores';
import { StateView } from '@presentation/app/recipes/[recipeId]/items/state-view';
import type { StateViewStatus } from '@presentation/app/recipes/[recipeId]/model/state-view-status';
import { SignInPromptSheet } from '@presentation/base/widgets/sheets/sign-in-prompt-sheet';
import { useGuestGate } from '@presentation/base/hooks/use-guest-gate';
import { useScrollToEndOnKeyboard } from '@presentation/base/hooks/use-scroll-to-end-on-keyboard';
import { useRecipeAuthor } from '@presentation/app/recipes/[recipeId]/hooks/use-recipe-author';
import type { ResolvedAuthor } from '@presentation/app/recipes/[recipeId]/model/resolved-author';
import { WebRecipeDetail } from '@presentation/app/recipes/[recipeId]/body/web-recipe-detail';
import { MobileRecipeDetail } from '@presentation/app/recipes/[recipeId]/body/mobile-recipe-detail';
import { RecipeFloatingActions } from '@presentation/app/recipes/[recipeId]/body/recipe-floating-actions';
import { DeleteRecipeSheet } from '@presentation/app/recipes/[recipeId]/sheets/delete-recipe-sheet';
import { useTaxonomyLabel } from '@presentation/app/recipes/shared/hooks/use-taxonomy-label';
import { RecipeShareSheet } from '@presentation/app/recipes/[recipeId]/sheets/recipe-share-sheet';
import { recipeWebUrl } from '@infrastructure/constants/api';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { t } from '@presentation/i18n';
import { spacing, radii, sizes } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import { showErrorToast } from '@presentation/base/feedback/show-toast';
import type { MediaItem } from '@domain/recipes/media-item';

export const RecipeDetailScreen = (): React.JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useTheme().colors;
  const { isWebShell } = useLayout();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ recipeId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';

  const { recipeDetailStore, savedRecipesStore, createdRecipesStore, authStore, favoritesStore, commentsStore, likesStore, userProfileStore } = useStores();
  const { cuisineLabel } = useTaxonomyLabel();
  const networkState = recipeDetailStore((s) => s.byId[recipeId]);
  const load = recipeDetailStore((s) => s.load);
  const localRecipe = createdRecipesStore((s) => s.findById(recipeId));
  const isSaved = savedRecipesStore((s) => s.savedIds.has(recipeId));
  const isLoading = favoritesStore((s) => s.isLoading);
  const authState = authStore((s) => s.state);
  const userId = authState.status === 'authenticated' ? authState.session.user.id : null;
  const { promptVisible, promptMessage, requestGate, closePrompt } = useGuestGate(userId);
  const goToSignIn = useCallback(() => {
    closePrompt();
    // Cast: the dynamic redirect param can't be statically verified against
    // expo-router's typed-routes union — same pattern as useAuthGuard.
    router.push(`/login?redirect=${encodeURIComponent(pathname)}` as Href);
  }, [closePrompt, pathname, router]);
  const recipeOwnerId = localRecipe?.ownerId ?? (networkState?.status === 'loaded' ? networkState.recipe.ownerId : null);
  const isOwner = userId !== null && recipeOwnerId !== null && recipeOwnerId === userId;
  const ownProfileState = userProfileStore((s) => s.state);
  const loadOwnProfile = userProfileStore((s) => s.load);
  // For an owned recipe the author is the signed-in user: take name/photo from
  // the session and the recipe count from the shared profile store (the same
  // source the Profile tab populates). Resolving the author through the shared
  // store would clobber the signed-in user's cached profile, so other authors
  // are fetched separately inside useRecipeAuthor.
  const owner: ResolvedAuthor | null =
    isOwner && authState.status === 'authenticated' && ownProfileState.status === 'loaded'
      ? {
          authorName: authState.session.user.displayName,
          authorPhotoUrl: authState.session.user.photoUrl,
          recipeCount: ownProfileState.profile.recipeCount,
          isOwner: true,
        }
      : null;
  const authorState = useRecipeAuthor({ ownerId: recipeOwnerId, owner, isOwner });

  useEffect(() => {
    if (isOwner && userId !== null && ownProfileState.status === 'idle') {
      void loadOwnProfile(userId);
    }
  }, [isOwner, userId, ownProfileState.status, loadOwnProfile]);

  const likeState = likesStore((s) => s.byRecipe[recipeId]);
  const commentState = commentsStore((s) => s.byRecipe[recipeId]);
  const deleteState = createdRecipesStore((s) => s.deleteState);
  const isDeleting = deleteState.status === 'deleting';
  const [shareOpen, setShareOpen] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const revealCommentInput = useScrollToEndOnKeyboard(scrollViewRef);

  const confirmDelete = useCallback(async () => {
    setDeleteError(null);
    await createdRecipesStore.getState().deleteRecipe(recipeId);
    const { deleteState: s } = createdRecipesStore.getState();
    if (s.status === 'success') {
      createdRecipesStore.getState().resetDeleteState();
      setShowDeleteSheet(false);
      // Wait for the modal dismiss animation to complete before navigating.
      setTimeout(() => router.back(), 300);
    } else if (s.status === 'error') {
      // WHY: the failure is shown inline inside the (still-open) confirm sheet
      // rather than as a toast — a global toast would be occluded by the modal
      // sheet. Other flows on the full screen below use toasts.
      createdRecipesStore.getState().resetDeleteState();
      setDeleteError(t().myRecipes.deleteError);
    }
  }, [recipeId, router, createdRecipesStore]);

  const handleDeleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      const removed = await commentsStore.getState().deleteComment(recipeId, commentId);
      if (!removed) {
        const failure = commentsStore.getState().byRecipe[recipeId]?.error;
        if (failure != null) showErrorToast(failure);
      }
    },
    [commentsStore, recipeId],
  );

  const handleAddComment = useCallback(async () => {
    const trimmed = commentInput.trim();
    if (trimmed.length === 0) return;
    const ok = await commentsStore.getState().addComment(recipeId, trimmed);
    if (ok) {
      setCommentInput('');
      setSubmitError(null);
    } else {
      setSubmitError(t().comments.error);
    }
  }, [commentInput, commentsStore, recipeId]);

  const handleToggleSave = useCallback(async () => {
    if (isLoading || !userId) return;
    if (isSaved) {
      await favoritesStore.getState().removeFavorite(userId, recipeId);
    } else {
      await favoritesStore.getState().addFavorite(userId, recipeId);
    }
    // WHY: the store records the failure on its `error` field rather than
    // throwing — surface it as a toast so a rejected save never passes silently.
    const failure = favoritesStore.getState().error;
    if (failure !== null) {
      showErrorToast(failure);
      favoritesStore.getState().clearError();
    }
  }, [isSaved, isLoading, recipeId, userId, favoritesStore]);

  const handleToggleLike = useCallback(async (): Promise<void> => {
    if (!userId) return;
    const result = await likesStore.getState().toggle(recipeId);
    if (!result.ok) showErrorToast(result.failure);
  }, [userId, recipeId, likesStore]);

  const handleToggleCommentLike = useCallback(async (commentId: string): Promise<void> => {
    if (userId === null) return;
    const result = await commentsStore.getState().toggleLike(recipeId, commentId);
    if (!result.ok) showErrorToast(result.failure);
  }, [userId, recipeId, commentsStore]);

  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  // Local (user-created) recipes short-circuit the network store entirely.
  const isLocal = localRecipe !== undefined;
  const recipeState =
    localRecipe !== undefined
      ? ({ status: 'loaded' as const, recipe: localRecipe })
      : networkState;

  useEffect(() => {
    if (
      !isLocal &&
      recipeId.length > 0 &&
      (networkState === undefined || networkState.status === 'idle')
    ) {
      void load(recipeId);
    }
  }, [isLocal, recipeId, networkState, load]);

  useEffect(() => {
    if (recipeState?.status === 'loaded' && commentState === undefined) {
      void commentsStore.getState().load(recipeId);
    }
  }, [recipeState?.status, commentState, commentsStore, recipeId]);

  // WHY: use primitives instead of recipeState object — the local-recipe path
  // creates a fresh wrapper object every render, so an object dependency would
  // re-fire syncFromApi on every render and trigger an infinite update loop.
  const syncLikeCount = recipeState?.status === 'loaded' ? recipeState.recipe.likeCount : null;
  const syncLikedByMe = recipeState?.status === 'loaded' ? recipeState.recipe.likedByMe : null;

  useEffect(() => {
    if (syncLikeCount !== null && syncLikedByMe !== null) {
      likesStore.getState().syncFromApi(recipeId, syncLikeCount, syncLikedByMe);
    }
  }, [syncLikeCount, syncLikedByMe, recipeId, likesStore]);

  // WHY: when the user reaches this screen from the main list (not My Recipes),
  // createdRecipesStore is empty, so isLocal is false and the edit form won't
  // pre-fill. Loading my recipes here ensures the store is populated before
  // the user taps Edit.
  useEffect(() => {
    if (isOwner && !isLocal) {
      void createdRecipesStore.getState().loadMyRecipes();
    }
  }, [isOwner, isLocal, createdRecipesStore]);

  const ingredientCount =
    recipeState?.status === 'loaded' ? recipeState.recipe.ingredients.length : 0;
  const instructionCount =
    recipeState?.status === 'loaded' ? recipeState.recipe.instructions.length : 0;

  useEffect(() => {
    if (ingredientCount > 0) {
      setCheckedIngredients(new Array(ingredientCount).fill(false) as boolean[]);
    }
  }, [ingredientCount]);

  useEffect(() => {
    if (instructionCount > 0) {
      setCompletedSteps(new Array(instructionCount).fill(false) as boolean[]);
    }
  }, [instructionCount]);

  const onRetry = useCallback(() => {
    if (recipeId.length > 0) {
      void load(recipeId);
    }
  }, [recipeId, load]);

  const toggleIngredient = useCallback((index: number) => {
    setCheckedIngredients((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const toggleStep = useCallback((index: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const current = recipeState ?? { status: 'loading' as const };
  const status: StateViewStatus =
    current.status === 'loading' || current.status === 'idle'
      ? 'loading'
      : current.status === 'error'
        ? 'error'
        : 'content';
  const failure: Failure | undefined =
    current.status === 'error' ? current.failure : undefined;

  return (
    <KeyboardAvoider style={[styles.root, { backgroundColor: colors.background }]}>
      <ResponsiveContainer route="recipeDetail" gutter={false} fill>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scroll}>
        <StateView status={status} failure={failure} onRetry={onRetry}>
          {current.status === 'loaded' ? (
            (() => {
              const recipe = current.recipe;
              // Photos only — videos are no longer shown in recipes.
              const images = recipe.media.filter((m) => m.type === 'image');
              const media: readonly MediaItem[] =
                images.length > 0
                  ? images
                  : [{ type: 'image', url: recipe.image }];

              const liked = likeState?.likedByMe ?? recipe.likedByMe;
              const likeCount = likeState?.likeCount ?? recipe.likeCount;

              if (isWebShell) {
                return (
                  <WebRecipeDetail
                    recipe={recipe}
                    recipeId={recipeId}
                    media={media}
                    isOwner={isOwner}
                    authorState={authorState}
                    liked={liked}
                    likeCount={likeCount}
                    userId={userId}
                    isSaved={isSaved}
                    saveDisabled={isLoading}
                    onBack={() => router.back()}
                    onToggleLike={() => requestGate(() => void handleToggleLike(), t().recipes.signInToLike)}
                    onToggleSave={() => requestGate(() => void handleToggleSave(), t().recipes.signInToSave)}
                    onEdit={() => router.push(`/create-recipe?recipeId=${recipeId}`)}
                    onDelete={() => setShowDeleteSheet(true)}
                    checkedIngredients={checkedIngredients}
                    onToggleIngredient={toggleIngredient}
                    completedSteps={completedSteps}
                    onToggleStep={toggleStep}
                    commentState={commentState}
                    commentInput={commentInput}
                    submitError={submitError}
                    onChangeCommentInput={setCommentInput}
                    onAddComment={() => requestGate(() => void handleAddComment(), t().comments.signInToComment)}
                    onLoadMoreComments={() => void commentsStore.getState().loadMore(recipeId)}
                    onToggleCommentLike={(id) =>
                      requestGate(() => void handleToggleCommentLike(id), t().comments.signInToLikeComment)
                    }
                    onDeleteComment={(id) => void handleDeleteComment(id)}
                  />
                );
              }

              return (
                <MobileRecipeDetail
                  recipe={recipe}
                  recipeId={recipeId}
                  media={media}
                  isOwner={isOwner}
                  isWebShell={isWebShell}
                  authorState={authorState}
                  liked={liked}
                  likeCount={likeCount}
                  userId={userId}
                  checkedIngredients={checkedIngredients}
                  onToggleIngredient={toggleIngredient}
                  completedSteps={completedSteps}
                  onToggleStep={toggleStep}
                  commentState={commentState}
                  commentInput={commentInput}
                  submitError={submitError}
                  onChangeCommentInput={setCommentInput}
                  onFocusCommentInput={revealCommentInput}
                  onToggleLike={() => requestGate(() => void handleToggleLike(), t().recipes.signInToLike)}
                  onEdit={() => router.push(`/create-recipe?recipeId=${recipeId}`)}
                  onDelete={() => setShowDeleteSheet(true)}
                  onAddComment={() => requestGate(() => void handleAddComment(), t().comments.signInToComment)}
                  onLoadMoreComments={() => void commentsStore.getState().loadMore(recipeId)}
                  onToggleCommentLike={(id) =>
                    requestGate(() => void handleToggleCommentLike(id), t().comments.signInToLikeComment)
                  }
                  onDeleteComment={(id) => void handleDeleteComment(id)}
                />
              );
            })()
          ) : null}
        </StateView>
      </ScrollView>
      </ResponsiveContainer>

      {!isWebShell ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backButton, { top: insets.top + 8, backgroundColor: colors.overlayLight }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.onOverlay} />
        </Pressable>
      ) : null}

      <DeleteRecipeSheet
        visible={showDeleteSheet}
        deleteError={deleteError}
        isDeleting={isDeleting}
        onClose={() => { setShowDeleteSheet(false); setDeleteError(null); }}
        onConfirm={() => void confirmDelete()}
      />

      <SignInPromptSheet
        visible={promptVisible}
        onClose={closePrompt}
        onSignIn={goToSignIn}
        message={promptMessage}
      />

      {current.status === 'loaded' ? (
        (() => {
          const recipe = current.recipe;
          const images = recipe.media.filter((m) => m.type === 'image');
          const firstImageUrl = images.length > 0 ? images[0].url : recipe.image;
          return (
            <>
              {!isWebShell ? (
                <RecipeFloatingActions
                  insetsTop={insets.top}
                  isOwner={isOwner}
                  likedByMe={likeState?.likedByMe ?? false}
                  isSaved={isSaved}
                  saveDisabled={isLoading}
                  onEdit={() => router.push(`/create-recipe?recipeId=${recipeId}`)}
                  onShare={() => setShareOpen(true)}
                  onToggleLike={() => requestGate(() => void handleToggleLike(), t().recipes.signInToLike)}
                  onToggleSave={() => requestGate(() => void handleToggleSave(), t().recipes.signInToSave)}
                />
              ) : null}
              <RecipeShareSheet
                visible={shareOpen}
                onClose={() => setShareOpen(false)}
                recipeName={recipe.name}
                cuisine={cuisineLabel(recipe.cuisine).name}
                imageUrl={firstImageUrl}
                url={recipeWebUrl(recipeId)}
              />
            </>
          );
        })()
      ) : null}
    </KeyboardAvoider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: sizes.floatingBtn,
    height: sizes.floatingBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecipeDetailScreen;
