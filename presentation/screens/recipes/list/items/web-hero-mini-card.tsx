import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeImage } from '@presentation/base/widgets/media/recipe-image';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { HERO_OVERLAY_DEEP, HERO_OVERLAY_FADE } from '@presentation/screens/recipes/list/model/web-hero-constants';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

export interface WebHeroMiniCardProps {
  recipe: RecipeSummary;
  /** Rank number rendered in the top-left badge (2 or 3). */
  rank: number;
  onPress: (id: string) => void;
}

/** Compact ranked hero card: bleed image, bottom gradient, rank badge, meta. */
export const WebHeroMiniCard = ({ recipe, rank, onPress }: WebHeroMiniCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const totalMin = recipe.totalTimeMinutes;
  return (
    <Pressable
      onPress={() => onPress(recipe.id)}
      accessibilityRole="button"
      accessibilityLabel={recipe.name}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <RecipeImage
        uri={recipe.image}
        style={styles.image}
        accessibilityLabel={recipe.name}
        placeholderLabel={t().recipes.noPhoto}
      />
      <LinearGradient
        colors={[HERO_OVERLAY_FADE, HERO_OVERLAY_DEEP]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      <View style={[styles.rankBadge, { backgroundColor: colors.onOverlay }]}>
        <ThemedText style={[styles.rankText, { color: colors.heroButtonText }]}>
          {String(rank)}
        </ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText numberOfLines={2} style={[styles.title, { color: colors.onOverlay }]}>
          {recipe.name}
        </ThemedText>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={sizes.iconSm} color={colors.starFilled} />
          <ThemedText style={[styles.meta, { color: colors.onOverlay }]}>
            {recipe.rating.toFixed(1)}
          </ThemedText>
          <Ionicons name="time-outline" size={sizes.iconSm} color={colors.onOverlay} />
          <ThemedText style={[styles.meta, { color: colors.onOverlay }]}>
            {totalMin} {t().recipes.minutes}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: sizes.heroMiniMinHeight,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.88,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  rankBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: sizes.rankBadge,
    height: sizes.rankBadge,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontWeight: '700',
    fontSize: fontSizes.heading,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    fontSize: fontSizes.small,
  },
});
