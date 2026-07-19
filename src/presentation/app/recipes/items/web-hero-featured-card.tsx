import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeImage } from '@presentation/base/widgets/media/recipe-image';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { difficultyLabel } from '@presentation/app/recipes/shared/model/difficulty-label';
import { WebHeroActionRow } from '@presentation/app/recipes/items/web-hero-action-row';
import {
  HERO_OVERLAY_DEEP,
  HERO_OVERLAY_MID,
  HERO_OVERLAY_FADE,
} from '@presentation/app/recipes/model/web-hero-constants';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import { ValueConstants } from '@core/constants';

export interface WebHeroFeaturedCardProps {
  recipe: RecipeSummary;
  onPress: (id: string) => void;
  /** When provided, renders the cosmetic frosted "Save" button. */
  onSave?: (id: string) => void;
  savedByMe?: boolean;
}

/** Large featured hero card: bleed image, diagonal overlay, title + actions. */
export const WebHeroFeaturedCard = ({
  recipe,
  onPress,
  onSave,
  savedByMe = false,
}: WebHeroFeaturedCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const totalMin = recipe.totalTimeMinutes;
  return (
    <View style={styles.card}>
      <RecipeImage
        uri={recipe.image}
        style={styles.image}
        accessibilityLabel={recipe.name}
        placeholderLabel={t().recipes.noPhoto}
      />
      <LinearGradient
        colors={[HERO_OVERLAY_DEEP, HERO_OVERLAY_MID, HERO_OVERLAY_FADE, HERO_OVERLAY_FADE]}
        locations={[ValueConstants.zero, 0.45, 0.8, 1]}
        start={{ x: 0.15, y: 1 }}
        end={{ x: 0.85, y: ValueConstants.zero }}
        style={styles.gradient}
      />
      {/* Full-bleed open overlay rendered BEFORE content so it sits below it
          in z-order. content is pointerEvents="box-none" so empty areas fall
          through to this overlay while the action-row buttons (real <button>s
          in content) stay on top — and are DOM siblings, never nested. */}
      <Pressable
        onPress={() => onPress(recipe.id)}
        accessibilityRole="button"
        accessibilityLabel={recipe.name}
        style={({ pressed }) => [styles.openOverlay, pressed ? styles.pressed : null]}
      />
      <View style={styles.content} pointerEvents="box-none">
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Ionicons name="flame" size={sizes.iconSm} color={colors.primaryText} />
          <ThemedText style={[styles.badgeText, { color: colors.primaryText }]}>
            {t().recipes.trending}
          </ThemedText>
        </View>

        <ThemedText
          numberOfLines={3}
          style={[styles.title, { color: colors.onOverlay, textShadowColor: colors.overlayLight }]}
        >
          {recipe.name}
        </ThemedText>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={sizes.iconSm} color={colors.starFilled} />
          <ThemedText style={[styles.meta, { color: colors.onOverlay }]}>
            {recipe.rating.toFixed(1)}
          </ThemedText>
          <Ionicons name="time-outline" size={sizes.iconSm} color={colors.onOverlay} />
          <ThemedText style={[styles.meta, { color: colors.onOverlay }]}>
            {t().recipes.heroTotalMin.replace('{n}', String(totalMin))}
          </ThemedText>
          <Ionicons name="speedometer-outline" size={sizes.iconSm} color={colors.onOverlay} />
          <ThemedText style={[styles.meta, { color: colors.onOverlay }]}>
            {difficultyLabel(recipe.difficulty)}
          </ThemedText>
        </View>

        <WebHeroActionRow
          onView={() => onPress(recipe.id)}
          onSave={onSave !== undefined ? () => onSave(recipe.id) : undefined}
          savedByMe={savedByMe}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: sizes.heroImageHeightWeb,
    borderRadius: radii.xxl2,
    overflow: 'hidden',
  },
  openOverlay: StyleSheet.absoluteFillObject,
  pressed: {
    opacity: 0.92,
  },
  image: {
    position: 'absolute',
    top: ValueConstants.zero,
    left: ValueConstants.zero,
    right: ValueConstants.zero,
    bottom: ValueConstants.zero,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    top: ValueConstants.zero,
    left: ValueConstants.zero,
    right: ValueConstants.zero,
    bottom: ValueConstants.zero,
  },
  content: {
    position: 'absolute',
    bottom: ValueConstants.zero,
    left: ValueConstants.zero,
    right: ValueConstants.zero,
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs2,
  },
  badgeText: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSizes.hero,
    fontWeight: '800',
    lineHeight: fontSizes.hero * 1.04,
    letterSpacing: -1,
    textShadowOffset: { width: ValueConstants.zero, height: 2 },
    textShadowRadius: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: fontSizes.medium,
  },
});
