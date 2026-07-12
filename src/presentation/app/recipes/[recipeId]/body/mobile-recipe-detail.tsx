import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { SectionHeader } from '@presentation/base/widgets/text/section-header';
import { MediaGallery } from '@presentation/app/recipes/[recipeId]/items/media-gallery';
import { RecipeMetaCard } from '@presentation/app/recipes/[recipeId]/items/recipe-meta-card';
import { IngredientCard } from '@presentation/app/recipes/[recipeId]/items/ingredient-card';
import { InstructionCard } from '@presentation/app/recipes/[recipeId]/items/instruction-card';
import { CommentCard } from '@presentation/app/recipes/[recipeId]/items/comment-card';
import { NutritionCard } from '@presentation/app/recipes/[recipeId]/items/nutrition-card';
import { RecipeAuthorCard } from '@presentation/app/recipes/[recipeId]/items/recipe-author-card';
import { SkeletonLoader } from '@presentation/base/widgets/loading/skeleton-loader';
import type { RecipeAuthorState } from '@presentation/app/recipes/[recipeId]/model/recipe-author-state';
import { useTaxonomyLabel } from '@presentation/app/recipes/shared/hooks/use-taxonomy-label';
import { useTheme } from '@presentation/base/theme/use-theme';
import { t } from '@presentation/i18n';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import type { Recipe } from '@domain/recipes/recipe';
import type { MediaItem } from '@domain/recipes/media-item';
import type { RecipeCommentsState } from '@application/comments/recipe-comments-state';

export interface MobileRecipeDetailProps {
  recipe: Recipe;
  recipeId: string;
  media: readonly MediaItem[];
  isOwner: boolean;
  isWebShell: boolean;
  authorState: RecipeAuthorState;
  liked: boolean;
  likeCount: number;
  userId: string | null;
  checkedIngredients: boolean[];
  onToggleIngredient: (index: number) => void;
  completedSteps: boolean[];
  onToggleStep: (index: number) => void;
  commentState: RecipeCommentsState | undefined;
  commentInput: string;
  submitError: string | null;
  onChangeCommentInput: (value: string) => void;
  onFocusCommentInput: () => void;
  onToggleLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddComment: () => void;
  onLoadMoreComments: () => void;
  onToggleCommentLike: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

/**
 * Single-column recipe-detail layout for the native/mobile shell. Mounted by the
 * screen only when `useLayout().isWebShell` is false; the web shell renders
 * `WebRecipeDetail` instead. Store loading and handlers are owned by the parent
 * screen and passed in — this component is presentational.
 */
export const MobileRecipeDetail = (props: MobileRecipeDetailProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { cuisineLabel } = useTaxonomyLabel();
  const {
    recipe,
    recipeId,
    media,
    isOwner,
    isWebShell,
    authorState,
    liked,
    likeCount,
    userId,
    checkedIngredients,
    completedSteps,
    commentState,
    commentInput,
    submitError,
  } = props;

  const commentTotal = commentState?.total ?? 0;
  const nutrition = recipe.nutrition;
  const hasNutrition =
    recipe.caloriesPerServing > 0 ||
    (nutrition?.protein ?? 0) > 0 ||
    (nutrition?.carbs ?? 0) > 0 ||
    (nutrition?.fat ?? 0) > 0 ||
    (nutrition?.fiber ?? 0) > 0;

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
            onPress={props.onToggleLike}
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

        {/* WHY: placed here (right below the title/rating/stats
        row) rather than after nutrition — tester feedback flagged
        a large empty gap in this spot with the author card
        stranded far below; closing that gap here also reads
        better since "who made this" belongs near the title. */}
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
              onToggle={() => props.onToggleIngredient(i)}
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
              onToggle={() => props.onToggleStep(i)}
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
                onPress={props.onEdit}
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
                onPress={props.onDelete}
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
                onPress={props.onDelete}
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
                canLike
                onToggleLike={() => props.onToggleCommentLike(comment.id)}
                onDelete={() => props.onDeleteComment(comment.id)}
              />
            ))}
          </View>
        )}

        {commentState !== undefined &&
        commentState.items.length < commentState.total ? (
          <Pressable
            onPress={props.onLoadMoreComments}
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

        <View style={styles.commentInputRow}>
          <TextInput
            value={commentInput}
            onChangeText={props.onChangeCommentInput}
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
            onFocus={props.onFocusCommentInput}
          />
          <Pressable
            onPress={props.onAddComment}
            disabled={
              commentState?.isSubmitting === true ||
              commentInput.trim().length === 0
            }
            accessibilityRole="button"
            accessibilityLabel={t().comments.send}
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
};

const styles = StyleSheet.create({
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
  submitError: {
    marginTop: spacing.xs,
  },
});
