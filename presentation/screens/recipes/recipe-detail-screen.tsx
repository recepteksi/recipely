import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { SectionHeader } from '@presentation/base/widgets/section-header';
import { MediaGallery } from '@presentation/base/widgets/media-gallery';
import { TimeCard } from '@presentation/base/widgets/time-card';
import { IngredientCard } from '@presentation/base/widgets/ingredient-card';
import { InstructionCard } from '@presentation/base/widgets/instruction-card';
import { CommentCard } from '@presentation/base/widgets/comment-card';
import {
  StateView,
  type StateViewStatus,
} from '@presentation/base/widgets/state-view';
import { BottomSheet } from '@presentation/base/widgets/bottom-sheet';
import { NutritionCard } from '@presentation/base/widgets/nutrition-card';
import { ResponsiveContainer } from '@presentation/base/widgets/responsive-container';
import { useTheme } from '@presentation/base/theme/theme-context';
import { t } from '@presentation/i18n';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import { showErrorToast } from '@presentation/base/feedback/show-toast';
import type { MediaItem } from '@domain/recipes/media-item';

interface InfoChipProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  iconColor?: string;
  chipBg: string;
  chipTextColor: string;
}

const InfoChip = ({
  icon,
  label,
  iconColor,
  chipBg,
  chipTextColor,
}: InfoChipProps): React.JSX.Element => (
  <View style={[styles.chip, { backgroundColor: chipBg }]}>
    <MaterialCommunityIcons
      name={icon}
      size={14}
      color={iconColor ?? chipTextColor}
      style={styles.chipIcon}
    />
    <ThemedText variant="caption" style={{ color: chipTextColor }}>
      {label}
    </ThemedText>
  </View>
);

export const RecipeDetailScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ recipeId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';

  const { recipeDetailStore, savedRecipesStore, createdRecipesStore, authStore, favoritesStore, commentsStore, likesStore } = useStores();
  const networkState = recipeDetailStore((s) => s.byId[recipeId]);
  const load = recipeDetailStore((s) => s.load);
  const localRecipe = createdRecipesStore((s) => s.findById(recipeId));
  const isSaved = savedRecipesStore((s) => s.savedIds.has(recipeId));
  const isLoading = favoritesStore((s) => s.isLoading);
  const authState = authStore((s) => s.state);
  const userId = authState.status === 'authenticated' ? authState.session.user.id : null;
  const recipeOwnerId = localRecipe?.ownerId ?? (networkState?.status === 'loaded' ? networkState.recipe.ownerId : null);
  const isOwner = userId !== null && recipeOwnerId !== null && recipeOwnerId === userId;
  const likeState = likesStore((s) => s.byRecipe[recipeId]);
  const commentState = commentsStore((s) => s.byRecipe[recipeId]);
  const deleteState = createdRecipesStore((s) => s.deleteState);
  const isDeleting = deleteState.status === 'deleting';
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
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

                    <View style={styles.chipsRow}>
                      <InfoChip
                        icon="earth"
                        label={recipe.cuisine}
                        chipBg={colors.chipBackground}
                        chipTextColor={colors.chipText}
                      />
                      <InfoChip
                        icon="speedometer"
                        label={recipe.difficulty}
                        chipBg={colors.chipBackground}
                        chipTextColor={colors.chipText}
                      />
                      <InfoChip
                        icon="star"
                        label={recipe.rating.toFixed(1)}
                        iconColor={colors.starFilled}
                        chipBg={colors.chipBackground}
                        chipTextColor={colors.chipText}
                      />
                      <InfoChip
                        icon="heart"
                        label={String(likeState?.likeCount ?? recipe.likeCount)}
                        iconColor={likeState?.likedByMe ?? recipe.likedByMe ? colors.likeActive : colors.chipText}
                        chipBg={colors.chipBackground}
                        chipTextColor={colors.chipText}
                      />
                    </View>

                    <View style={styles.timeRow}>
                      <TimeCard
                        label={t().recipes.prepTime}
                        minutes={recipe.prepTimeMinutes}
                        iconName="time-outline"
                        recipeId={recipeId}
                        recipeName={recipe.name}
                        slot="prep"
                      />
                      <TimeCard
                        label={t().recipes.cookTime}
                        minutes={recipe.cookTimeMinutes}
                        iconName="flame-outline"
                        recipeId={recipeId}
                        recipeName={recipe.name}
                        slot="cook"
                      />
                    </View>

                    <View style={styles.nutritionRow}>
                      <NutritionCard
                        caloriesPerServing={recipe.caloriesPerServing}
                        servings={recipe.servings}
                        nutrition={recipe.nutrition}
                      />
                    </View>

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

                    <SectionHeader title={t().recipes.ingredients} />
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

                    <SectionHeader title={t().recipes.instructions} />
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
                      <View style={styles.ownerActions}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t().myRecipes.editRecipe}
                          onPress={() => router.push(`/create-recipe?recipeId=${recipeId}`)}
                          style={({ pressed }) => [
                            styles.ownerBtn,
                            { backgroundColor: colors.primaryLight, opacity: pressed ? 0.75 : 1 },
                          ]}
                        >
                          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                          <ThemedText variant="caption" style={[styles.ownerBtnLabel, { color: colors.primary }]}>
                            {t().myRecipes.editRecipe}
                          </ThemedText>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t().myRecipes.deleteRecipe}
                          onPress={() => setShowDeleteSheet(true)}
                          style={({ pressed }) => [
                            styles.ownerBtn,
                            styles.ownerBtnDanger,
                            { opacity: pressed ? 0.75 : 1, backgroundColor: colors.dangerLight },
                          ]}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.danger} />
                          <ThemedText variant="caption" style={[styles.ownerBtnLabel, { color: colors.danger }]}>
                            {t().myRecipes.deleteRecipe}
                          </ThemedText>
                        </Pressable>
                      </View>
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
                            createdAt={comment.createdAt}
                            isOwn={comment.authorId === userId}
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

      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8, backgroundColor: colors.overlayLight }]}
      >
        <Ionicons name="chevron-back" size={24} color={colors.onOverlay} />
      </Pressable>

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
        <View style={[styles.floatingActions, { top: insets.top + 8 }]}>
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
    </KeyboardAvoidingView>
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs2,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  nutritionRow: {
    marginTop: spacing.md,
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
  ownerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs2,
    height: sizes.searchBarHeight,
    borderRadius: radii.round,
  },
  ownerBtnDanger: {},
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
