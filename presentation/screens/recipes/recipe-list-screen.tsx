import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipeListItem } from '@presentation/screens/recipes/recipe-list-item';
import { SearchBar } from '@presentation/base/widgets/search-bar';
import { SkeletonCard } from '@presentation/base/widgets/skeleton-card';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { TabBar, type TabBarKey } from '@presentation/base/widgets/tab-bar';
import { BottomSheet } from '@presentation/base/widgets/bottom-sheet';
import { SelectChip } from '@presentation/base/widgets/select-chip';
import { useTheme } from '@presentation/base/theme/theme-context';
import { t } from '@presentation/i18n';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import type { Recipe } from '@domain/recipes/recipe';
import { CUISINE_KEY_VALUES, type CuisineKey } from '@domain/recipes/cuisine-key';
import { RECIPE_CATEGORY_VALUES, type RecipeCategory } from '@domain/recipes/recipe-category';
import { DIFFICULTY_VALUES, type Difficulty } from '@domain/recipes/difficulty';
import type { RecipeFilters } from '@domain/recipes/i-recipe-repository';

type SortKey = 'popular' | 'rating' | 'time' | 'newest' | 'mostLiked';

interface UiFilters {
  cuisines: CuisineKey[];
  categories: RecipeCategory[];
  difficulties: Difficulty[];
  maxTime: number;
}

const TIME_OPTIONS: readonly number[] = [0, 15, 30, 45, 60, 90];

const SORT_TO_API: Record<SortKey, RecipeFilters['sort']> = {
  popular: 'popular',
  rating: 'rating',
  time: 'time',
  newest: 'newest',
  mostLiked: 'mostLiked',
};

const emptyFilters: UiFilters = { cuisines: [], categories: [], difficulties: [], maxTime: 0 };

/** Formats a SCREAMING_SNAKE_CASE enum value to Title Case for display. */
const formatLabel = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ItemSeparator = (): React.JSX.Element => <View style={styles.separator} />;

const LoadingSkeleton = (): React.JSX.Element => (
  <ScrollView contentContainerStyle={styles.skeletonContainer}>
    {Array.from({ length: 3 }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </ScrollView>
);

export const RecipeListScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { recipeListStore } = useStores();
  const state = recipeListStore((s) => s.state);
  const load = recipeListStore((s) => s.load);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [filters, setFilters] = useState<UiFilters>(emptyFilters);
  const [pendingFilters, setPendingFilters] = useState<UiFilters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState<'filter' | 'sort' | null>(null);

  useEffect(() => {
    if (state.status === 'idle') {
      void load();
    }
  }, [state.status, load]);

  const onRefresh = useCallback(() => {
    void load(buildApiFilters(filters, sortBy));
  }, [load, filters, sortBy]);

  const openRecipe = useCallback(
    (id: string) => {
      router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: id } });
    },
    [router],
  );

  const buildApiFilters = (f: UiFilters, sort: SortKey): RecipeFilters => ({
    ...(f.cuisines.length > 0 ? { cuisines: f.cuisines } : {}),
    ...(f.categories.length > 0 ? { categories: f.categories } : {}),
    ...(f.difficulties.length > 0 ? { difficulties: f.difficulties } : {}),
    ...(f.maxTime > 0 ? { maxTime: f.maxTime } : {}),
    sort: SORT_TO_API[sort],
  });

  const applyFilters = (): void => {
    setFilters(pendingFilters);
    setSheetOpen(null);
    void load(buildApiFilters(pendingFilters, sortBy));
  };

  const openFilterSheet = (): void => {
    setPendingFilters(filters);
    setSheetOpen('filter');
  };

  const activeFilterCount =
    filters.cuisines.length +
    filters.categories.length +
    filters.difficulties.length +
    (filters.maxTime > 0 ? 1 : 0);

  // Client-side search for responsiveness; API handles all other filters.
  const filteredRecipes = useMemo(() => {
    if (state.status !== 'loaded') return [];
    const query = search.trim().toLowerCase();
    if (query.length === 0) return state.recipes;
    return state.recipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [state, search]);

  const sortLabels: Record<SortKey, string> = {
    popular: t().recipes.sortPopular,
    rating: t().recipes.sortRating,
    time: t().recipes.sortTime,
    newest: t().recipes.sortNewest,
    mostLiked: t().recipes.sortMostLiked,
  };

  const togglePendingCuisine = (c: CuisineKey): void =>
    setPendingFilters((f) => ({
      ...f,
      cuisines: f.cuisines.includes(c) ? f.cuisines.filter((x) => x !== c) : [...f.cuisines, c],
    }));

  const togglePendingCategory = (c: RecipeCategory): void =>
    setPendingFilters((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));

  const togglePendingDifficulty = (d: Difficulty): void =>
    setPendingFilters((f) => ({
      ...f,
      difficulties: f.difficulties.includes(d)
        ? f.difficulties.filter((x) => x !== d)
        : [...f.difficulties, d],
    }));

  const setPendingMaxTime = (m: number): void =>
    setPendingFilters((f) => ({ ...f, maxTime: m }));

  const resetFilters = (): void => {
    const reset = emptyFilters;
    setFilters(reset);
    setPendingFilters(reset);
    void load();
  };

  const removeCuisineFilter = (c: CuisineKey): void => {
    const next = { ...filters, cuisines: filters.cuisines.filter((x) => x !== c) };
    setFilters(next);
    setPendingFilters(next);
    void load(buildApiFilters(next, sortBy));
  };

  const removeDifficultyFilter = (d: Difficulty): void => {
    const next = { ...filters, difficulties: filters.difficulties.filter((x) => x !== d) };
    setFilters(next);
    setPendingFilters(next);
    void load(buildApiFilters(next, sortBy));
  };

  const removeCategoryFilter = (c: RecipeCategory): void => {
    const next = { ...filters, categories: filters.categories.filter((x) => x !== c) };
    setFilters(next);
    setPendingFilters(next);
    void load(buildApiFilters(next, sortBy));
  };

  const removeMaxTimeFilter = (): void => {
    const next = { ...filters, maxTime: 0 };
    setFilters(next);
    setPendingFilters(next);
    void load(buildApiFilters(next, sortBy));
  };

  const onTabChange = (key: TabBarKey): void => {
    if (key === 'myRecipes') router.replace('/my-recipes');
    else if (key === 'settings') router.replace('/settings');
  };

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <RecipeListItem recipe={item} onPress={() => openRecipe(item.id)} />
    ),
    [openRecipe],
  );

  const headerControls = (
    <View>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t().recipes.searchPlaceholder}
        />
      </View>

      <View style={styles.pillRow}>
        <Pressable
          onPress={openFilterSheet}
          style={[
            styles.pill,
            {
              backgroundColor: activeFilterCount > 0 ? colors.primary : colors.surface,
              borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons
            name="funnel-outline"
            size={14}
            color={activeFilterCount > 0 ? colors.primaryText : colors.text}
          />
          <ThemedText
            variant="caption"
            style={[
              styles.pillLabel,
              { color: activeFilterCount > 0 ? colors.primaryText : colors.text },
            ]}
          >
            {t().recipes.filter}
          </ThemedText>
          {activeFilterCount > 0 ? (
            <View style={[styles.pillBadge, { backgroundColor: colors.gradientBorder }]}>
              <ThemedText
                variant="caption"
                style={[styles.pillBadgeText, { color: colors.primaryText }]}
              >
                {activeFilterCount}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => setSheetOpen('sort')}
          style={[
            styles.pill,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="swap-vertical" size={14} color={colors.text} />
          <ThemedText
            variant="caption"
            style={[styles.pillLabel, { color: colors.text }]}
          >
            {sortLabels[sortBy]}
          </ThemedText>
        </Pressable>

        {activeFilterCount > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsRow}
          >
            {filters.cuisines.map((c) => (
              <Pressable
                key={c}
                onPress={() => removeCuisineFilter(c)}
                style={[styles.activeChip, { backgroundColor: colors.chipBackground }]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.activeChipText, { color: colors.chipText }]}
                >
                  {formatLabel(c)} ×
                </ThemedText>
              </Pressable>
            ))}
            {filters.categories.map((c) => (
              <Pressable
                key={c}
                onPress={() => removeCategoryFilter(c)}
                style={[styles.activeChip, { backgroundColor: colors.chipBackground }]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.activeChipText, { color: colors.chipText }]}
                >
                  {formatLabel(c)} ×
                </ThemedText>
              </Pressable>
            ))}
            {filters.difficulties.map((d) => (
              <Pressable
                key={d}
                onPress={() => removeDifficultyFilter(d)}
                style={[styles.activeChip, { backgroundColor: colors.chipBackground }]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.activeChipText, { color: colors.chipText }]}
                >
                  {formatLabel(d)} ×
                </ThemedText>
              </Pressable>
            ))}
            {filters.maxTime > 0 ? (
              <Pressable
                onPress={removeMaxTimeFilter}
                style={[styles.activeChip, { backgroundColor: colors.chipBackground }]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.activeChipText, { color: colors.chipText }]}
                >
                  ≤ {filters.maxTime} {t().recipes.minutes} ×
                </ThemedText>
              </Pressable>
            ) : null}
          </ScrollView>
        ) : null}
      </View>

      {state.status === 'loaded' ? (
        <View style={styles.countRow}>
          <ThemedText variant="caption" muted>
            {filteredRecipes.length} {t().recipes.results}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );

  let body: React.JSX.Element;
  if (state.status === 'idle' || state.status === 'loading') {
    body = (
      <ScreenContainer padded={false}>
        <LoadingSkeleton />
      </ScreenContainer>
    );
  } else if (state.status === 'error') {
    const failure: Failure = state.failure;
    body = (
      <ScreenContainer padded={false}>
        <View style={styles.center}>
          <MaterialCommunityIcons name="food-off" size={64} color={colors.textMuted} />
          <ThemedText variant="subtitle" style={styles.errorTitle}>
            {t().common.error}
          </ThemedText>
          <ThemedText variant="body" muted style={styles.errorMessage}>
            {failure.message}
          </ThemedText>
          <View style={styles.retryButton}>
            <PrimaryButton label={t().common.retry} onPress={onRefresh} />
          </View>
        </View>
      </ScreenContainer>
    );
  } else if (filteredRecipes.length === 0 && state.recipes.length === 0) {
    body = (
      <ScreenContainer padded={false}>
        {activeFilterCount > 0 ? headerControls : null}
        <View style={styles.center}>
          <MaterialCommunityIcons name="food-off" size={64} color={colors.textMuted} />
          <ThemedText variant="body" muted style={styles.errorTitle}>
            {activeFilterCount > 0 ? t().recipes.noResults : t().recipes.empty}
          </ThemedText>
          <View style={styles.retryButton}>
            {activeFilterCount > 0 ? (
              <PrimaryButton label={t().recipes.clearFilters} onPress={resetFilters} />
            ) : (
              <PrimaryButton label={t().common.retry} onPress={onRefresh} />
            )}
          </View>
        </View>
      </ScreenContainer>
    );
  } else if (filteredRecipes.length === 0) {
    body = (
      <ScreenContainer padded={false}>
        {headerControls}
        <View style={styles.center}>
          <Ionicons name="search" size={48} color={colors.textMuted} />
          <ThemedText variant="body" muted style={styles.errorTitle}>
            {t().recipes.noResults}
          </ThemedText>
          {activeFilterCount > 0 ? (
            <View style={styles.retryButton}>
              <PrimaryButton label={t().recipes.clearFilters} onPress={resetFilters} />
            </View>
          ) : null}
        </View>
      </ScreenContainer>
    );
  } else {
    body = (
      <ScreenContainer padded={false}>
        <FlatList
          data={filteredRecipes}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          ListHeaderComponent={headerControls}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        />
      </ScreenContainer>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {body}

      <BottomSheet
        visible={sheetOpen === 'filter'}
        title={t().recipes.filter}
        onClose={() => setSheetOpen(null)}
        rightAction={
          activeFilterCount > 0
            ? { label: t().recipes.clearFilters, onPress: resetFilters }
            : undefined
        }
      >
        <View style={styles.sheetSection}>
          <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
            {t().recipes.cuisine}
          </ThemedText>
          <View style={styles.chipsWrap}>
            {CUISINE_KEY_VALUES.map((c) => (
              <SelectChip
                key={c}
                label={formatLabel(c)}
                selected={pendingFilters.cuisines.includes(c)}
                onToggle={() => togglePendingCuisine(c)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
            {t().recipes.category}
          </ThemedText>
          <View style={styles.chipsWrap}>
            {RECIPE_CATEGORY_VALUES.map((c) => (
              <SelectChip
                key={c}
                label={formatLabel(c)}
                selected={pendingFilters.categories.includes(c)}
                onToggle={() => togglePendingCategory(c)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
            {t().recipes.difficulty}
          </ThemedText>
          <View style={styles.chipsRow}>
            {DIFFICULTY_VALUES.map((d) => (
              <SelectChip
                key={d}
                label={formatLabel(d)}
                selected={pendingFilters.difficulties.includes(d)}
                onToggle={() => togglePendingDifficulty(d)}
                flex
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
            {t().recipes.maxTime}
          </ThemedText>
          <View style={styles.chipsWrap}>
            {TIME_OPTIONS.map((m) => (
              <SelectChip
                key={m}
                label={m === 0 ? t().recipes.any : `≤ ${m} ${t().recipes.minutes}`}
                selected={pendingFilters.maxTime === m}
                onToggle={() => setPendingMaxTime(m)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetCta}>
          <PrimaryButton
            label={`${t().recipes.showResults}`}
            onPress={applyFilters}
          />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={sheetOpen === 'sort'}
        title={t().recipes.sortBy}
        onClose={() => setSheetOpen(null)}
      >
        {(Object.keys(sortLabels) as SortKey[]).map((key) => {
          const isActive = sortBy === key;
          return (
            <Pressable
              key={key}
              onPress={() => {
                setSortBy(key);
                void load(buildApiFilters(filters, key));
                setSheetOpen(null);
              }}
              style={[
                styles.sortRow,
                { backgroundColor: isActive ? colors.chipBackground : 'transparent' },
              ]}
            >
              <ThemedText
                variant="body"
                style={{ fontWeight: isActive ? '600' : '500' }}
              >
                {sortLabels[key]}
              </ThemedText>
              {isActive ? (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </BottomSheet>

      <TabBar active="recipes" onChange={onTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchWrapper: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs2,
    height: sizes.selectorHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1.5,
  },
  pillLabel: {
    fontWeight: '600',
    fontSize: fontSizes.caption,
  },
  pillBadge: {
    minWidth: sizes.iconXxs,
    height: sizes.iconXxs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadgeText: {
    fontSize: fontSizes.micro,
    fontWeight: '700',
  },
  activeChipsRow: {
    gap: spacing.xs2,
    alignItems: 'center',
    paddingRight: spacing.lg,
  },
  activeChip: {
    height: sizes.chipHeight,
    paddingHorizontal: spacing.sm2,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChipText: {
    fontWeight: '600',
    fontSize: fontSizes.small,
  },
  countRow: {
    paddingBottom: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  sheetSection: {
    marginBottom: spacing.lg,
  },
  sheetSectionTitle: {
    marginBottom: spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs2,
  },
  sheetCta: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.xs,
  },
});
