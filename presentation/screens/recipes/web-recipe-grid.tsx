import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { WebRecipeCard } from '@presentation/screens/recipes/web-recipe-card';
import { WebSectionHead } from '@presentation/screens/recipes/web-section-head';
import { WebSortMenu } from '@presentation/screens/recipes/web-sort-menu';
import { difficultyLabel } from '@presentation/screens/recipes/difficulty-label';
import type { SortKey } from '@presentation/screens/recipes/recipe-sort';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { Recipe } from '@domain/recipes/recipe';
import { DIFFICULTY_VALUES, type Difficulty } from '@domain/recipes/difficulty';

const GRID_GAP = spacing.lg2;

export interface WebRecipeGridProps {
  recipes: Recipe[];
  isSearching: boolean;
  /** First applied cuisine key, or `null` — drives the section-head title. */
  activeCuisineLabel: string | null;
  sortBy: SortKey;
  /** Selects a sort option; the parent applies it and reloads the list. */
  onChangeSort: (key: SortKey) => void;
  /** Opens the full filter sheet (cuisine / category / difficulty / max-time). */
  onOpenFilter: () => void;
  /** Count of applied filters; shown as a badge on the filter button when > 0. */
  activeFilterCount: number;
  activeDifficulty: Difficulty | null;
  onDifficultyChange: (d: Difficulty | null) => void;
  gridColumns: number;
  onOpenRecipe: (id: string) => void;
  /** True when the recipe id is in the signed-in user's saved set. */
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
}

/**
 * Web-only recipe grid: section head + difficulty segmented control + sort menu
 * above an auto-fill card grid of `WebRecipeCard`s.
 */
export const WebRecipeGrid = ({
  recipes, isSearching, activeCuisineLabel, sortBy, onChangeSort,
  onOpenFilter, activeFilterCount, activeDifficulty, onDifficultyChange,
  gridColumns, onOpenRecipe, isSaved, onToggleSave,
}: WebRecipeGridProps): React.JSX.Element => {
  const colors = useTheme().colors;

  const title = isSearching
    ? t().recipes.webSearchResults
    : activeCuisineLabel !== null
      ? t().recipes.webCuisineRecipes.replace('{cuisine}', activeCuisineLabel)
      : t().recipes.webAllRecipes;

  const renderItem = useCallback(
    ({ item }: { item: Recipe }): React.JSX.Element => (
      <View style={styles.gridCell}>
        <WebRecipeCard
          recipe={item}
          saved={isSaved(item.id)}
          onOpen={onOpenRecipe}
          onToggleSave={onToggleSave}
        />
      </View>
    ),
    [onOpenRecipe, isSaved, onToggleSave],
  );

  const segButton = (key: string, label: string, active: boolean, onPress: () => void): React.JSX.Element => (
    <Pressable
      key={key}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.segBtn, active ? [shadows.sm, { backgroundColor: colors.cardBackground }] : null]}
    >
      <ThemedText style={[styles.segText, { color: colors.text, fontWeight: active ? '700' : '400' }]}>
        {label}
      </ThemedText>
    </Pressable>
  );

  const right = (
    <View style={styles.controls}>
      <View style={[styles.segment, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        {segButton('ALL', t().recipes.difficultyAll, activeDifficulty === null, () => onDifficultyChange(null))}
        {DIFFICULTY_VALUES.map((d) =>
          segButton(d, difficultyLabel(d), activeDifficulty === d, () => onDifficultyChange(d)),
        )}
      </View>
      <Pressable
        onPress={onOpenFilter}
        accessibilityRole="button"
        accessibilityLabel={t().recipes.filter}
        style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
      >
        <Ionicons name="funnel-outline" size={sizes.iconSm} color={colors.textMuted} />
        <ThemedText style={[styles.filterLabel, { color: colors.text }]}>
          {t().recipes.filter}
        </ThemedText>
        {activeFilterCount > 0 ? (
          <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={[styles.filterBadgeText, { color: colors.primaryText }]}>
              {activeFilterCount}
            </ThemedText>
          </View>
        ) : null}
      </Pressable>
      <WebSortMenu current={sortBy} onChange={onChangeSort} />
    </View>
  );

  return (
    <View>
      {/* Lift the section head (which hosts the sort dropdown) above the recipe
          grid: the grid is a later sibling and would otherwise paint over the
          absolutely-positioned popover. */}
      <View style={styles.headRow}>
        <WebSectionHead
          title={title}
          sub={t().recipes.webRecipesCount.replace('{n}', String(recipes.length))}
          right={right}
        />
      </View>
      {recipes.length === 0 ? (
        <View style={[styles.empty, { borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={sizes.iconXl} color={colors.textMuted} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
            {t().recipes.noResults}
          </ThemedText>
          <ThemedText style={[styles.emptyBody, { color: colors.textMuted }]}>
            {t().recipes.webEmptyBody}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          key={`web-grid-${gridColumns}`}
          data={recipes}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          numColumns={gridColumns}
          scrollEnabled={false}
          columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
          contentContainerStyle={styles.gridContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Establishes a stacking context above the grid so the sort dropdown popover
  // (absolutely positioned inside the head) is not painted over by the cards.
  headRow: {
    position: 'relative',
    zIndex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: sizes.webSortBtn,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  filterLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: sizes.iconXxs,
    height: sizes.iconXxs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: fontSizes.micro,
    fontWeight: '700',
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xxs,
  },
  segBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs2,
    borderRadius: radii.md,
  },
  segText: {
    fontSize: fontSizes.caption,
  },
  gridContent: {
    gap: GRID_GAP,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridCell: {
    flex: 1,
    minWidth: 0,
  },
  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIcon: {
    width: sizes.webEmptyIcon,
    height: sizes.webEmptyIcon,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: fontSizes.subtitle,
  },
  emptyBody: {
    fontSize: fontSizes.body,
  },
});
