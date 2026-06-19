import { useEffect, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipeImage } from '@presentation/base/widgets/recipe-image';
import { SkeletonLoader } from '@presentation/base/widgets/skeleton-loader';
import { useStores } from '@presentation/bootstrap/stores-context';
import { useTaxonomyLabel } from '@presentation/screens/recipes/use-taxonomy-label';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t, useLocale } from '@presentation/i18n';
import type { Recipe } from '@domain/recipes/recipe';

/** Fixed width of a compact trending card. */
const CARD_WIDTH = 230;
/** Skeleton placeholder cards shown while the rail is loading. */
const SKELETON_COUNT = 3;

export interface TrendingStripProps {
  onOpenRecipe: (id: string) => void;
}

/**
 * Horizontal "Trending this week" discover rail. Owns its own data: triggers
 * `load()` on mount when the store is `idle`. Shows skeleton placeholders while
 * loading, and renders `null` on error or an empty result so the rail simply
 * disappears without disrupting the main recipe list below it.
 *
 * The endpoint localizes its content server-side via the `Accept-Language`
 * header, so the rail re-fetches on every language switch (mirroring the main
 * recipe list) to avoid showing stale server-localized names.
 */
export const TrendingStrip = ({ onOpenRecipe }: TrendingStripProps): React.JSX.Element | null => {
  const colors = useTheme().colors;
  const { cuisineLabel } = useTaxonomyLabel();
  const { trendingRecipesStore } = useStores();
  const state = trendingRecipesStore((s) => s.state);
  const load = trendingRecipesStore((s) => s.load);
  // Subscribe to the locale so a language switch re-runs the reload effect below.
  const language = useLocale();

  useEffect(() => {
    if (state.status === 'idle') {
      void load();
    }
  }, [state.status, load]);

  // Recipe content is localized server-side via `Accept-Language`, so a language
  // switch must re-fetch the rail. Skip the first run so this doesn't double-load
  // alongside the idle-guard mount effect above.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    void load();
  }, [language, load]);

  const header = (
    <View style={styles.header}>
      <Ionicons name="flame" size={sizes.iconMd} color={colors.primary} />
      <ThemedText variant="body" style={styles.title}>
        {t().recipes.trending}
      </ThemedText>
    </View>
  );

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <View style={styles.section}>
        {header}
        <View style={styles.skeletonRow}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <View
              key={i}
              style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
            >
              <SkeletonLoader width={CARD_WIDTH} height={sizes.reviewImageHeight} borderRadius={0} />
              <View style={styles.cardBody}>
                <SkeletonLoader width="70%" height={fontSizes.subtitle} borderRadius={radii.sm} />
                <SkeletonLoader width="45%" height={fontSizes.caption} borderRadius={radii.sm} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (state.status === 'error' || state.recipes.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: Recipe }): React.JSX.Element => (
    <Pressable
      onPress={() => onOpenRecipe(item.id)}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      style={[styles.card, shadows.md, { backgroundColor: colors.cardBackground }]}
    >
      <RecipeImage
        uri={item.image}
        style={styles.image}
        accessibilityLabel={item.name}
        placeholderLabel={t().recipes.noPhoto}
      />
      <View style={styles.cardBody}>
        <ThemedText variant="subtitle" numberOfLines={2}>
          {item.name}
        </ThemedText>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="star" size={sizes.iconSm} color={colors.starFilled} />
          <ThemedText variant="caption" muted style={styles.metaText}>
            {item.rating.toFixed(1)}
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.metaDot}>
            •
          </ThemedText>
          <ThemedText variant="caption" muted numberOfLines={1} style={styles.metaCuisine}>
            {cuisineLabel(item.cuisine).name}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.section}>
      {header}
      <FlatList
        data={state.recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  image: {
    width: CARD_WIDTH,
    height: sizes.reviewImageHeight,
    resizeMode: 'cover',
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontWeight: '600',
  },
  metaDot: {
    fontSize: fontSizes.caption,
  },
  metaCuisine: {
    flex: 1,
  },
});
