import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonLoader } from '@presentation/base/widgets/skeleton-loader';
import { WebHeroFeaturedCard } from '@presentation/screens/recipes/web-hero-featured-card';
import { WebHeroMiniCard } from '@presentation/screens/recipes/web-hero-mini-card';
import { useStores } from '@presentation/bootstrap/stores-context';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { useLocale } from '@presentation/i18n';

/** Window width (px) below which the hero collapses to the featured card only. */
const STACK_WIDTH = 700;
/** Height of each mini-card skeleton so two fill the hero column. */
const MINI_SKELETON_HEIGHT = (sizes.heroImageHeightWeb - spacing.sm2) / 2;

export interface WebHeroSectionProps {
  onOpenRecipe: (id: string) => void;
}

/**
 * Web-only editorial hero: a featured trending recipe beside two ranked
 * mini-cards. Owns the `trendingRecipesStore` (loads on idle, re-fetches on
 * locale change — server localizes content via `Accept-Language`). Renders a
 * skeleton while loading and `null` on error or fewer than 3 recipes.
 */
export const WebHeroSection = ({ onOpenRecipe }: WebHeroSectionProps): React.JSX.Element | null => {
  const { trendingRecipesStore } = useStores();
  const state = trendingRecipesStore((s) => s.state);
  const load = trendingRecipesStore((s) => s.load);
  const { width } = useLayout();
  const language = useLocale();

  useEffect(() => {
    if (state.status === 'idle') {
      void load();
    }
  }, [state.status, load]);

  // Re-fetch on locale switch (skip the first run so it doesn't double-load
  // alongside the idle-guard mount effect above).
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    void load();
  }, [language, load]);

  const stacked = width < STACK_WIDTH;

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <View style={[styles.row, stacked ? styles.stacked : null]}>
        <View style={styles.featured}>
          <SkeletonLoader width="100%" height={sizes.heroImageHeightWeb} borderRadius={radii.xxl2} />
        </View>
        {stacked ? null : (
          <View style={styles.mini}>
            <SkeletonLoader width="100%" height={MINI_SKELETON_HEIGHT} borderRadius={radii.xxl} />
            <SkeletonLoader width="100%" height={MINI_SKELETON_HEIGHT} borderRadius={radii.xxl} />
          </View>
        )}
      </View>
    );
  }

  if (state.status === 'error' || state.recipes.length < 3) {
    return null;
  }

  const [featured, mini1, mini2] = state.recipes;

  return (
    <View style={[styles.row, stacked ? styles.stacked : null]}>
      <View style={styles.featured}>
        <WebHeroFeaturedCard recipe={featured} onPress={onOpenRecipe} />
      </View>
      {stacked ? null : (
        <View style={styles.mini}>
          <WebHeroMiniCard recipe={mini1} rank={2} onPress={onOpenRecipe} />
          <WebHeroMiniCard recipe={mini2} rank={3} onPress={onOpenRecipe} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm2,
    marginBottom: spacing.lg,
  },
  stacked: {
    flexDirection: 'column',
  },
  featured: {
    flex: 1.9,
    minWidth: 0,
  },
  mini: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    gap: spacing.sm2,
  },
});
