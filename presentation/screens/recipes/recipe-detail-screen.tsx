import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/keyboard-avoider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { SectionHeader } from '@presentation/base/widgets/section-header';
import { MediaGallery } from '@presentation/base/widgets/media-gallery';
import { RecipeMetaCard } from '@presentation/base/widgets/recipe-meta-card';
import { IngredientCard } from '@presentation/base/widgets/ingredient-card';
import { InstructionCard } from '@presentation/base/widgets/instruction-card';
import { CommentCard } from '@presentation/base/widgets/comment-card';
import {
  StateView,
  type StateViewStatus,
} from '@presentation/base/widgets/state-view';
import { BottomSheet } from '@presentation/base/widgets/bottom-sheet';
import { NutritionCard } from '@presentation/base/widgets/nutrition-card';
import { RecipeAuthorCard } from '@presentation/screens/recipes/recipe-author-card';
import { useRecipeAuthor, type ResolvedAuthor } from '@presentation/screens/recipes/use-recipe-author';
import { WebRecipeDetail } from '@presentation/screens/recipes/web-recipe-detail';
import { useTaxonomyLabel } from '@presentation/screens/recipes/use-taxonomy-label';
import { RecipeShareSheet } from '@presentation/base/widgets/recipe-share-sheet';
import { SkeletonLoader } from '@presentation/base/widgets/skeleton-loader';
import { recipeWebUrl } from '@infrastructure/constants/api';
import { ResponsiveContainer } from '@presentation/base/widgets/responsive-container';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { t } from '@presentation/i18n';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import { showErrorToast } from '@presentation/base/feedback/show-toast';
import type { MediaItem } from '@domain/recipes/media-item';

export const RecipeDetailScreen = (): React.JSX.Element => {
  const router = useRouter();
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
     
    console.log('[SaveButton] handleToggleSave called!', { isLoading, userId, recipeId });
    if (isLoading || !userId) {
      console.log('[SaveButton] Skipping: isLoading=' + isLoading + ', userId=' + userId);
      return;
    }
    try {
      console.log('[SaveButton] Toggling favorite...', { userId, recipeId, isSaved });
      if (isSaved) {
        console.log('[SaveButton] Removing favorite...');
        await favoritesStore.getState().removeFavorite(userId, recipeId);
      } else {
        console.log('[SaveButton] Adding favorite...');
        await favoritesStore.getState().addFavorite(userId, recipeId);
      }
      // WHY: the store records the failure on its `error` field rather than
      // throwing — surface it as a toast so a rejected save never passes silently.
      const failure = favoritesStore.getState().error;
      if (failure !== null) {
        showErrorToast(failure);
        favoritesStore.getState().clearError();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[SaveButton] Error:', errorMsg);
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
              const commentTotal = commentState?.total ?? 0;
              const nutrition = recipe.nutrition;
              const hasNutrition =
                recipe.caloriesPerServing > 0 ||
                (nutrition?.protein ?? 0) > 0 ||
                (nutrition?.carbs ?? 0) > 0 ||
                (nutrition?.fat ?? 0) > 0 ||
                (nutrition?.fiber ?? 0) > 0;

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
                    saveDisabled={isLoading || !userId}
                    onBack={() => router.back()}
                    onToggleLike={() => void handleToggleLike()}
                    onToggleSave={() => void handleToggleSave()}
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
                    onAddComment={() => void handleAddComment()}
                    onLoadMoreComments={() => void commentsStore.getState().loadMore(recipeId)}
                    onToggleCommentLike={(id) => void handleToggleCommentLike(id)}
                    onDeleteComment={(id) => void handleDeleteComment(id)}
                  />
                );
              }

              return (
                <View>
                  <MediaGallery media={media} />

                  <View
                    style={[
                      styles.content,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <ThemedText variant="title">{recipe.name}</ThemedText>

                    <View style={styles.captionRow}>
                      {recipe.cuisine.length > 0 ? (
                        <View style={styles.captionItem}>
                          <Ionicons
                            name="globe-outline"
                            size={sizes.iconCaption}
                            color={colors.textMuted}
                          />
                          <ThemedText style={[styles.captionText, { color: colors.textMuted }]}>
                            {cuisineLabel(recipe.cuisine).name}
                          </ThemedText>
                        </View>
                      ) : null}
                      {recipe.rating > 0 ? (
                        <View style={styles.captionItem}>
                          <Ionicons name="star" size={sizes.iconCaption} color={colors.starFilled} />
                          <ThemedText style={[styles.captionRating, { color: colors.text }]}>
                            {recipe.rating.toFixed(1)}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.statsStrip}>
                      <Pressable
                        onPress={handleToggleLike}
                        disabled={!userId}
                        accessibilityRole="button"
                        accessibilityLabel={liked ? t().recipes.unlike : t().recipes.like}
                        style={styles.statItem}
                      >
                        <MaterialCommunityIcons
                          name={liked ? 'heart' : 'heart-outline'}
                          size={sizes.iconSm}
                          color={liked ? colors.likeActive : colors.textMuted}
                        />
                        <ThemedText
                          style={[
                            styles.statText,
                            { color: liked ? colors.likeActive : colors.textMuted },
                          ]}
                        >
                          {String(likeCount)}
                        </ThemedText>
                      </Pressable>
                      {recipe.viewCount > 0 ? (
                        <View style={styles.statItem}>
                          <Ionicons name="eye-outline" size={sizes.iconSm} color={colors.textMuted} />
                          <ThemedText style={[styles.statText, { color: colors.textMuted }]}>
                            {recipe.viewCount.toLocaleString()}
                          </ThemedText>
                        </View>
                      ) : null}
                      {commentTotal > 0 ? (
                        <View style={styles.statItem}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={sizes.iconSm}
                            color={colors.textMuted}
                          />
                          <ThemedText style={[styles.statText, { color: colors.textMuted }]}>
                            {String(commentTotal)}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>

                    <RecipeMetaCard
                      prepTimeMinutes={recipe.prepTimeMinutes}
                      cookTimeMinutes={recipe.cookTimeMinutes}
                      servings={recipe.servings}
                      difficulty={recipe.difficulty}
                      recipeId={recipeId}
                      recipeName={recipe.name}
                    />

                    {hasNutrition ? (
                      <>
                        <SectionHeader title={t().recipes.nutrition} />
                        <NutritionCard
                          caloriesPerServing={recipe.caloriesPerServing}
                          servings={recipe.servings}
                          nutrition={recipe.nutrition}
                        />
                      </>
                    ) : null}

                    {authorState.status === 'loading' ? (
                      <View style={styles.authorSkeleton}>
                        <SkeletonLoader
                          width={sizes.avatarSm}
                          height={sizes.avatarSm}
                          borderRadius={radii.round}
                        />
                        <View style={styles.authorSkeletonText}>
                          <SkeletonLoader width="40%" height={fontSizes.micro} />
                          <SkeletonLoader width="65%" height={fontSizes.body} />
                        </View>
                      </View>
                    ) : authorState.status === 'resolved' ? (
                      <RecipeAuthorCard
                        authorName={authorState.author.authorName}
                        authorPhotoUrl={authorState.author.authorPhotoUrl}
                        recipeCount={authorState.author.recipeCount}
                        isOwner={authorState.author.isOwner}
                      />
                    ) : null}

                    {recipe.tags.length > 0 ? (
                      <View style={styles.tagsRow}>
                        {recipe.tags.map((tag) => (
                          <View
                            key={tag}
                            style={[
                              styles.tag,
                              { backgroundColor: colors.chipBackground },
                            ]}
                          >
                            <ThemedText
                              variant="caption"
                              style={{ color: colors.chipText }}
                            >
                              {tag}
                            </ThemedText>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <SectionHeader
                      title={`${t().recipes.ingredients} · ${recipe.ingredients.length}`}
                    />
                    <View style={styles.cardsList}>
                      {recipe.ingredients.map((item, i) => (
                        <IngredientCard
                          key={i}
                          raw={item}
                          checked={checkedIngredients[i] ?? false}
                          onToggle={() => toggleIngredient(i)}
                        />
                      ))}
                    </View>

                    <SectionHeader
                      title={`${t().recipes.instructions} · ${recipe.instructions.length}`}
                    />
                    <View style={styles.cardsList}>
                      {recipe.instructions.map((step, i) => (
                        <InstructionCard
                          key={i}
                          index={i}
                          step={step}
                          completed={completedSteps[i] ?? false}
                          onToggle={() => toggleStep(i)}
                          recipeId={recipeId}
                          recipeName={recipe.name}
                        />
                      ))}
                    </View>

                    {isOwner ? (
                      isWebShell ? (
                        // WEB: design's header-cluster button language — ghost
                        // "Edit" pill + ghost "Delete" pill (danger-tinted).
                        <View style={styles.ownerActionsWeb}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t().myRecipes.editRecipe}
                            onPress={() => router.push(`/create-recipe?recipeId=${recipeId}`)}
                            style={({ pressed }) => [
                              styles.ghostPill,
                              { backgroundColor: colors.surface, borderColor: colors.cardBorder, opacity: pressed ? 0.75 : 1 },
                            ]}
                          >
                            <Ionicons name="create-outline" size={16} color={colors.text} />
                            <ThemedText variant="caption" style={[styles.ownerBtnLabel, { color: colors.text }]}>
                              {t().myRecipes.editRecipe}
                            </ThemedText>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t().myRecipes.deleteRecipe}
                            onPress={() => setShowDeleteSheet(true)}
                            style={({ pressed }) => [
                              styles.ghostPill,
                              { backgroundColor: colors.surface, borderColor: colors.cardBorder, opacity: pressed ? 0.75 : 1 },
                            ]}
                          >
                            <Ionicons name="trash-outline" size={16} color={colors.danger} />
                            <ThemedText variant="caption" style={[styles.ownerBtnLabel, { color: colors.danger }]}>
                              {t().myRecipes.deleteRecipe}
                            </ThemedText>
                          </Pressable>
                        </View>
                      ) : (
                        // MOBILE: edit lives in the floating overlay cluster (a
                        // pencil button, per the design); delete stays inline as
                        // a single danger button.
                        <View style={styles.ownerActions}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t().myRecipes.deleteRecipe}
                            onPress={() => setShowDeleteSheet(true)}
                            style={({ pressed }) => [
                              styles.ownerBtn,
                              { opacity: pressed ? 0.75 : 1, backgroundColor: colors.dangerLight },
                            ]}
                          >
                            <Ionicons name="trash-outline" size={16} color={colors.danger} />
                            <ThemedText variant="caption" style={[styles.ownerBtnLabel, { color: colors.danger }]}>
                              {t().myRecipes.deleteRecipe}
                            </ThemedText>
                          </Pressable>
                        </View>
                      )
                    ) : null}

                    <SectionHeader
                      title={
                        commentState?.total
                          ? `${t().comments.title} · ${commentState.total}`
                          : t().comments.title
                      }
                    />

                    {commentState?.isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                        style={styles.commentsLoader}
                      />
                    ) : !commentState || commentState.items.length === 0 ? (
                      <ThemedText variant="caption" muted style={styles.commentsEmpty}>
                        {t().comments.empty}
                      </ThemedText>
                    ) : (
                      <View style={styles.commentsList}>
                        {commentState.items.map((comment) => (
                          <CommentCard
                            key={comment.id}
                            body={comment.body}
                            authorDisplayName={comment.authorDisplayName}
                            authorPhotoUrl={comment.authorPhotoUrl}
                            createdAt={comment.createdAt}
                            isOwn={comment.authorId === userId}
                            likeCount={comment.likeCount}
                            likedByMe={comment.likedByMe}
                            canLike={userId !== null}
                            onToggleLike={() => void handleToggleCommentLike(comment.id)}
                            onDelete={() => void handleDeleteComment(comment.id)}
                          />
                        ))}
                      </View>
                    )}

                    {commentState !== undefined &&
                    commentState.items.length < commentState.total ? (
                      <Pressable
                        onPress={() => void commentsStore.getState().loadMore(recipeId)}
                        style={({ pressed }) => [
                          styles.loadMoreBtn,
                          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <ThemedText variant="caption" muted>
                          {commentState.isLoadingMore
                            ? t().common.loading
                            : t().comments.loadMore}
                        </ThemedText>
                      </Pressable>
                    ) : null}

                    {userId !== null ? (
                      <View style={styles.commentInputRow}>
                        <TextInput
                          value={commentInput}
                          onChangeText={setCommentInput}
                          placeholder={t().comments.placeholder}
                          placeholderTextColor={colors.textMuted}
                          style={[
                            styles.commentInput,
                            {
                              backgroundColor: colors.surface,
                              color: colors.text,
                              borderColor: colors.border,
                            },
                          ]}
                          multiline
                          maxLength={2000}
                          onFocus={() => {
                            setTimeout(
                              () => scrollViewRef.current?.scrollToEnd({ animated: true }),
                              150,
                            );
                          }}
                        />
                        <Pressable
                          onPress={() => void handleAddComment()}
                          disabled={
                            commentState?.isSubmitting === true ||
                            commentInput.trim().length === 0
                          }
                          style={({ pressed }) => [
                            styles.commentSendBtn,
                            {
                              backgroundColor: colors.primary,
                              opacity:
                                pressed ||
                                commentState?.isSubmitting === true ||
                                commentInput.trim().length === 0
                                  ? 0.6
                                  : 1,
                            },
                          ]}
                        >
                          <Ionicons name="send" size={16} color={colors.onOverlay} />
                        </Pressable>
                      </View>
                    ) : (
                      <ThemedText variant="caption" muted style={styles.signInHint}>
                        {t().comments.signInToComment}
                      </ThemedText>
                    )}

                    {submitError !== null ? (
                      <ThemedText
                        variant="caption"
                        style={[styles.submitError, { color: colors.danger }]}
                      >
                        {submitError}
                      </ThemedText>
                    ) : null}

                  </View>
                </View>
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

      <BottomSheet
        visible={showDeleteSheet}
        title={t().myRecipes.deleteConfirmTitle}
        hideCloseButton
        onClose={() => { setShowDeleteSheet(false); setDeleteError(null); }}
      >
        <ThemedText variant="body" muted style={styles.deleteSheetBody}>
          {t().myRecipes.deleteConfirm}
        </ThemedText>
        {deleteError !== null ? (
          <ThemedText variant="caption" style={[styles.deleteSheetError, { color: colors.danger }]}>
            {deleteError}
          </ThemedText>
        ) : null}
        <View style={styles.deleteSheetActions}>
          <Pressable
            onPress={() => { setShowDeleteSheet(false); setDeleteError(null); }}
            style={({ pressed }) => [
              styles.deleteSheetBtn,
              { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <ThemedText variant="body" style={styles.semiBold}>
              {t().common.cancel}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => void confirmDelete()}
            disabled={isDeleting}
            style={({ pressed }) => [
              styles.deleteSheetBtn,
              styles.deleteSheetBtnDanger,
              { opacity: pressed || isDeleting ? 0.7 : 1, backgroundColor: colors.dangerLight },
            ]}
          >
            <ThemedText variant="body" style={[styles.deleteSheetBtnDangerLabel, styles.semiBold, { color: colors.danger }]}>
              {isDeleting ? t().common.loading : t().myRecipes.deleteRecipe}
            </ThemedText>
          </Pressable>
        </View>
      </BottomSheet>

      {current.status === 'loaded' ? (
        (() => {
          const recipe = current.recipe;
          const images = recipe.media.filter((m) => m.type === 'image');
          const firstImageUrl = images.length > 0 ? images[0].url : recipe.image;
          return (
            <>
              {!isWebShell ? (
              <View style={[styles.floatingActions, { top: insets.top + 8 }]}>
                {isOwner && !isWebShell ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t().myRecipes.editRecipe}
                    onPress={() => router.push(`/create-recipe?recipeId=${recipeId}`)}
                    style={[styles.floatingBtn, { backgroundColor: colors.overlayLight }]}
                  >
                    <Ionicons name="pencil" size={sizes.iconMd} color={colors.onOverlay} />
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t().recipes.share}
                  onPress={() => setShareOpen(true)}
                  style={[styles.floatingBtn, { backgroundColor: colors.overlayLight }]}
                >
                  <Ionicons name="share-social-outline" size={sizes.iconMd} color={colors.onOverlay} />
                </Pressable>
                <Pressable
                  onPress={handleToggleLike}
                  accessibilityRole="button"
                  accessibilityLabel={likeState?.likedByMe ? t().recipes.unlike : t().recipes.like}
                  disabled={!userId}
                  style={[styles.floatingBtn, { opacity: !userId ? 0.5 : 1, backgroundColor: colors.overlayLight }]}
                >
                  <MaterialCommunityIcons
                    name={likeState?.likedByMe ? 'heart' : 'heart-outline'}
                    size={20}
                    color={likeState?.likedByMe ? colors.likeActive : colors.onOverlay}
                  />
                </Pressable>
                <Pressable
                  onPress={handleToggleSave}
                  accessibilityRole="button"
                  accessibilityLabel={isSaved ? 'Remove from favorites' : 'Add to favorites'}
                  disabled={isLoading || !userId}
                  style={[styles.floatingBtn, { opacity: isLoading || !userId ? 0.5 : 1, backgroundColor: colors.overlayLight }]}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={isLoading || !userId ? colors.textMuted : colors.onOverlay}
                  />
                </Pressable>
              </View>
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
  content: {
    marginTop: -spacing.xxl,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs2,
  },
  captionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  captionText: {
    fontSize: fontSizes.captionLg,
    fontWeight: '600',
  },
  captionRating: {
    fontSize: fontSizes.captionLg,
    fontWeight: '700',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
  },
  authorSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  authorSkeletonText: {
    flex: 1,
    gap: spacing.xs2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tag: {
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm2,
    paddingVertical: spacing.xs,
  },
  cardsList: {
    gap: spacing.sm,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  ownerActionsWeb: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
  },
  ownerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs2,
    height: sizes.searchBarHeight,
    borderRadius: radii.round,
  },
  ghostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs2,
    height: sizes.searchBarHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  ownerBtnLabel: {
    fontWeight: '600',
    fontSize: fontSizes.caption,
  },
  deleteSheetBody: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  deleteSheetError: {
    marginBottom: spacing.md,
  },
  deleteSheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  deleteSheetBtn: {
    flex: 1,
    height: sizes.buttonSmHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSheetBtnDanger: {},
  deleteSheetBtnDangerLabel: {},
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: sizes.floatingBtn,
    height: sizes.floatingBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingActions: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  floatingBtn: {
    width: sizes.floatingBtn,
    height: sizes.floatingBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsLoader: {
    marginVertical: spacing.md,
  },
  commentsEmpty: {
    marginTop: spacing.sm,
  },
  commentsList: {
    gap: spacing.sm,
  },
  loadMoreBtn: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  commentInput: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: sizes.searchBarHeight,
  },
  commentSendBtn: {
    width: sizes.searchBarHeight,
    height: sizes.searchBarHeight,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInHint: {
    marginTop: spacing.sm,
  },
  submitError: {
    marginTop: spacing.xs,
  },
  semiBold: {
    fontWeight: '600' as const,
  },
});
