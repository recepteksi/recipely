import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeImage } from '@presentation/base/widgets/media/recipe-image';
import { InstructionCard } from '@presentation/app/recipes/[recipeId]/items/instruction-card';
import { WebRecipeDetailHeader } from '@presentation/app/recipes/[recipeId]/body/web-recipe-detail-header';
import { WebRecipeDetailSidebar } from '@presentation/app/recipes/[recipeId]/body/web-recipe-detail-sidebar';
import { WebRecipeDetailComments } from '@presentation/app/recipes/[recipeId]/body/web-recipe-detail-comments';
import type { RecipeAuthorState } from '@presentation/app/recipes/[recipeId]/model/recipe-author-state';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { Recipe } from '@domain/recipes/recipe';
import type { MediaItem } from '@domain/recipes/media-item';
import type { RecipeCommentsState } from '@application/comments/recipe-comments-state';

export interface WebRecipeDetailProps {
  recipe: Recipe;
  recipeId: string;
  media: readonly MediaItem[];
  isOwner: boolean;
  authorState: RecipeAuthorState;
  liked: boolean;
  likeCount: number;
  userId: string | null;
  isSaved: boolean;
  saveDisabled: boolean;
  onBack: () => void;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  checkedIngredients: boolean[];
  onToggleIngredient: (index: number) => void;
  completedSteps: boolean[];
  onToggleStep: (index: number) => void;
  commentState: RecipeCommentsState | undefined;
  commentInput: string;
  submitError: string | null;
  onChangeCommentInput: (value: string) => void;
  onAddComment: () => void;
  onLoadMoreComments: () => void;
  onToggleCommentLike: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const HERO_ASPECT = 16 / 10;

// react-native-web honours CSS `position: sticky`, which RN's ViewStyle type
// omits. This component only renders on the web shell, so widen the value
// locally via a plain object (no `unknown` double-cast).
const stickyBase = { position: 'sticky', top: sizes.webDetailStickyTop };
const stickyColumn = stickyBase as ViewStyle;

/**
 * Two-column SaaS recipe-detail layout for the web shell. The mobile screen
 * renders its own single-column layout; this component is only mounted when
 * `useLayout().isWebShell` is true. Store loading and handlers are owned by the
 * parent screen and passed in — this component holds only the active-image
 * selection state.
 */
export const WebRecipeDetail = (props: WebRecipeDetailProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { width } = useLayout();
  const [activeImage, setActiveImage] = useState(0);
  const { recipe, recipeId, media } = props;
  const twoColumn = width >= sizes.webDetailTwoColMin;
  const activeUrl = media[activeImage]?.url ?? recipe.image;

  return (
    <View style={styles.page}>
      <Pressable
        onPress={props.onBack}
        accessibilityRole="button"
        accessibilityLabel={t().recipes.backToRecipes}
        style={styles.backLink}
      >
        <Ionicons name="chevron-back" size={sizes.iconMd} color={colors.textMuted} />
        <ThemedText variant="body" style={[styles.backLabel, { color: colors.textMuted }]}>
          {t().recipes.backToRecipes}
        </ThemedText>
      </Pressable>

      <WebRecipeDetailHeader
        recipe={recipe}
        authorState={props.authorState}
        liked={props.liked}
        likeCount={props.likeCount}
        onToggleLike={props.onToggleLike}
        isOwner={props.isOwner}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        isSaved={props.isSaved}
        saveDisabled={props.saveDisabled}
        onToggleSave={props.onToggleSave}
      />

      <View style={[styles.grid, twoColumn ? styles.gridRow : styles.gridColumn]}>
        <View style={styles.mainColumn}>
          <View style={[styles.hero, { borderColor: colors.cardBorder }]}>
            <RecipeImage
              uri={activeUrl}
              style={styles.heroImage}
              accessibilityLabel={recipe.name}
              placeholderLabel={t().recipes.noPhoto}
            />
          </View>

          {media.length > 1 ? (
            <View style={styles.thumbStrip}>
              {media.map((item, i) => (
                <Pressable
                  key={`${item.url}:${String(i)}`}
                  onPress={() => setActiveImage(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`${recipe.name} ${String(i + 1)}`}
                  style={[
                    styles.thumb,
                    { borderColor: i === activeImage ? colors.primary : colors.cardBorder },
                    i === activeImage ? styles.thumbActive : null,
                  ]}
                >
                  <RecipeImage uri={item.url} style={styles.thumbImage} placeholderCompact />
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              {`${t().recipes.instructions} · ${String(recipe.instructions.length)}`}
            </ThemedText>
            <View style={styles.stepList}>
              {recipe.instructions.map((step, i) => (
                <InstructionCard
                  key={i}
                  index={i}
                  step={step}
                  completed={props.completedSteps[i] ?? false}
                  onToggle={() => props.onToggleStep(i)}
                  recipeId={recipeId}
                  recipeName={recipe.name}
                />
              ))}
            </View>
          </View>

          <WebRecipeDetailComments
            commentState={props.commentState}
            userId={props.userId}
            commentInput={props.commentInput}
            submitError={props.submitError}
            onChangeCommentInput={props.onChangeCommentInput}
            onAddComment={props.onAddComment}
            onLoadMore={props.onLoadMoreComments}
            onToggleCommentLike={props.onToggleCommentLike}
            onDeleteComment={props.onDeleteComment}
          />
        </View>

        <View style={[styles.sideColumn, twoColumn ? stickyColumn : null]}>
          <WebRecipeDetailSidebar
            recipe={recipe}
            checkedIngredients={props.checkedIngredients}
            onToggleIngredient={props.onToggleIngredient}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  backLabel: {
    fontWeight: '600',
  },
  grid: {
    gap: sizes.webDetailColGap,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gridColumn: {
    flexDirection: 'column',
  },
  mainColumn: {
    flex: 1.7,
    minWidth: 0,
    gap: spacing.xl,
  },
  sideColumn: {
    flex: 1,
    minWidth: 0,
  },
  hero: {
    aspectRatio: HERO_ASPECT,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumb: {
    width: sizes.webDetailThumbWidth,
    height: sizes.webDetailThumbHeight,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbActive: {
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    gap: spacing.md,
  },
  heading: {
    fontSize: fontSizes.subheading,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  stepList: {
    gap: spacing.sm,
  },
});
