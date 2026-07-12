import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { SectionHeader } from '@presentation/base/widgets/text/section-header';
import { RecipeMetaCard } from '@presentation/app/recipes/[recipeId]/items/recipe-meta-card';
import { NutritionCard } from '@presentation/app/recipes/[recipeId]/items/nutrition-card';
import { RecipeAuthorCard } from '@presentation/app/recipes/[recipeId]/items/recipe-author-card';
import { SkeletonLoader } from '@presentation/base/widgets/loading/skeleton-loader';
import type { RecipeAuthorState } from '@presentation/app/recipes/[recipeId]/model/recipe-author-state';
import { useTaxonomyLabel } from '@presentation/app/recipes/shared/hooks/use-taxonomy-label';
import { useTheme } from '@presentation/base/theme/use-theme';
import { t } from '@presentation/i18n';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import type { Recipe } from '@domain/recipes/recipe';

export interface RecipeOverviewProps {
  recipe: Recipe;
  recipeId: string;
  liked: boolean;
  likeCount: number;
  commentTotal: number;
  authorState: RecipeAuthorState;
  onToggleLike: () => void;
}

/**
 * Recipe header block for the mobile detail screen: title, cuisine/rating caption,
 * like/view/comment stats, author card, meta card, nutrition, and tags.
 */
export const RecipeOverview = ({
  recipe,
  recipeId,
  liked,
  likeCount,
  commentTotal,
  authorState,
  onToggleLike,
}: RecipeOverviewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { cuisineLabel } = useTaxonomyLabel();

  const nutrition = recipe.nutrition;
  const hasNutrition =
    recipe.caloriesPerServing > 0 ||
    (nutrition?.protein ?? 0) > 0 ||
    (nutrition?.carbs ?? 0) > 0 ||
    (nutrition?.fat ?? 0) > 0 ||
    (nutrition?.fiber ?? 0) > 0;

  return (
    <>
      <ThemedText variant="title">{recipe.name}</ThemedText>

      <View style={styles.captionRow}>
        {recipe.cuisine.length > 0 ? (
          <View style={styles.captionItem}>
            <Ionicons name="globe-outline" size={sizes.iconCaption} color={colors.textMuted} />
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
          onPress={onToggleLike}
          accessibilityRole="button"
          accessibilityLabel={liked ? t().recipes.unlike : t().recipes.like}
          style={styles.statItem}
        >
          <MaterialCommunityIcons
            name={liked ? 'heart' : 'heart-outline'}
            size={sizes.iconSm}
            color={liked ? colors.likeActive : colors.textMuted}
          />
          <ThemedText style={[styles.statText, { color: liked ? colors.likeActive : colors.textMuted }]}>
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
            <Ionicons name="chatbubble-outline" size={sizes.iconSm} color={colors.textMuted} />
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
          <SkeletonLoader width={sizes.avatarSm} height={sizes.avatarSm} borderRadius={radii.round} />
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
            <View key={tag} style={[styles.tag, { backgroundColor: colors.chipBackground }]}>
              <ThemedText variant="caption" style={{ color: colors.chipText }}>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
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
});
