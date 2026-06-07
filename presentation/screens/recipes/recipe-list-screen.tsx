import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipeListItem } from '@presentation/screens/recipes/recipe-list-item';
import { RecipesAppHeader } from '@presentation/screens/recipes/recipes-app-header';
import { AiBannerCard } from '@presentation/screens/recipes/ai-banner-card';
import { CuisineStrip } from '@presentation/screens/recipes/cuisine-strip';
import { SearchBar } from '@presentation/base/widgets/search-bar';
import { SkeletonCard } from '@presentation/base/widgets/skeleton-card';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { ErrorState } from '@presentation/base/widgets/error-state';
import {
  failureContent,
  failureIcon,
  failureSeverity,
} from '@presentation/base/errors/failure-content';
import { TabBar, type TabBarKey } from '@presentation/base/widgets/tab-bar';
import { BottomSheet } from '@presentation/base/widgets/bottom-sheet';
import { SelectChip } from '@presentation/base/widgets/select-chip';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useWebShellState } from '@presentation/base/responsive/web-shell-state';
import { useTheme } from '@presentation/base/theme/theme-context';
import { t, useLocale } from '@presentation/i18n';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import type { Failure } from '@presentation/base/types';
import type { Recipe } from '@domain/recipes/recipe';
import { CUISINE_KEY_VALUES, type CuisineKey } from '@domain/recipes/cuisine-key';
import { RECIPE_CATEGORY_VALUES, type RecipeCategory } from '@domain/recipes/recipe-category';
import { DIFFICULTY_VALUES, type Difficulty } from '@domain/recipes/difficulty';
import type { RecipeFilters } from '@domain/recipes/i-recipe-repository';

const RECIPE_CARD_MIN_WIDTH = 320;
const GRID_GAP = spacing.lg2;
/** Skeleton cards shown on mobile / single-column while the list loads. */
const SKELETON_CARD_COUNT = 4;
/** Rows of skeleton cards to fill the web grid while the list loads. */
const SKELETON_GRID_ROWS = 2;

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

interface LoadingSkeletonProps {
  /** Column count of the loaded list, so the skeleton matches its layout. */
  gridColumns: number;
  /** Whether the web shell is active (centers the grid to the content max). */
  isWebShell: boolean;
}

/**
 * Placeholder shown while the recipe list loads. Mirrors the loaded list's
 * layout exactly: a left-aligned stacked column on mobile, and on the web shell
 * the same centered (maxWidth 1200) container — a multi-column grid when
 * `gridColumns > 1`, or a centered stacked column on a narrow window.
 */
const LoadingSkeleton = ({ gridColumns, isWebShell }: LoadingSkeletonProps): React.JSX.Element => {
  // Mobile: simple stacked single column, matching the non-web list look.
  if (!isWebShell) {
    return (
      <ScrollView contentContainerStyle={styles.skeletonContainer}>
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </ScrollView>
    );
  }

  // Web shell: always centered to the content max, mirroring the loaded list.
  // Multi-column renders the grid; a narrow window (gridColumns === 1) renders
  // a stacked column with the same centering and separator spacing.
  if (gridColumns > 1) {
    const count = Math.max(SKELETON_CARD_COUNT, gridColumns * SKELETON_GRID_ROWS);
    const rows = Math.ceil(count / gridColumns);
    return (
      <ScrollView
        style={[styles.list, styles.listCenter]}
        contentContainerStyle={[styles.listContent, styles.gridListContent]}
      >
        {Array.from({ length: rows }, (_, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {Array.from({ length: gridColumns }, (_, colIndex) => (
              <View key={colIndex} style={styles.gridCell}>
                <SkeletonCard />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.list, styles.listCenter]}
      contentContainerStyle={styles.listContent}
    >
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
        <View key={i}>
          {i > 0 ? <ItemSeparator /> : null}
          <SkeletonCard />
        </View>
      ))}
    </ScrollView>
  );
};

export const RecipeListScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { recipeListStore, notificationsStore } = useStores();
  const unreadCount = notificationsStore((s) => s.unreadCount);
  const state = recipeListStore((s) => s.state);
  const load = recipeListStore((s) => s.load);
  const { isWebShell, width } = useLayout();
  const { searchQuery: webSearchQuery } = useWebShellState();
  // Subscribe to locale so the screen re-renders (and reloads, below) on a
  // language switch even while it sits back-stacked under Settings.
  const language = useLocale();

  const [search, setSearch] = useState('');

  // Grid columns: 1 on mobile, auto-fill at RECIPE_CARD_MIN_WIDTH on web shell,
  // capped to the centered 1200px content max so cards stay readable.
  const gridColumns = useMemo<number>(() => {
    if (!isWebShell) return 1;
    const available = Math.min(width, 1200) - spacing.xl * 2;
    return Math.max(1, Math.floor((available + GRID_GAP) / (RECIPE_CARD_MIN_WIDTH + GRID_GAP)));
  }, [isWebShell, width]);
  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [filters, setFilters] = useState<UiFilters>(emptyFilters);
  const [pendingFilters, setPendingFilters] = useState<UiFilters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState<'filter' | 'sort' | null>(null);

  useEffect(() => {
    if (state.status === 'idle') {
      void load();
    }
  }, [state.status, load]);

  const buildApiFilters = useCallback(
    (f: UiFilters, sort: SortKey): RecipeFilters => ({
      ...(f.cuisines.length > 0 ? { cuisines: f.cuisines } : {}),
      ...(f.categories.length > 0 ? { categories: f.categories } : {}),
      ...(f.difficulties.length > 0 ? { difficulties: f.difficulties } : {}),
      ...(f.maxTime > 0 ? { maxTime: f.maxTime } : {}),
      sort: SORT_TO_API[sort],
    }),
    [],
  );

  const onRefresh = useCallback(() => {
    void load(buildApiFilters(filters, sortBy));
  }, [load, filters, sortBy, buildApiFilters]);

  // Recipe content is localized server-side via the `Accept-Language` header,
  // so a language switch must re-fetch the list (UI strings refresh via the
  // `language` subscription above). Refs keep the latest filters/sort without
  // re-running this effect when they change — only the locale should trigger it.
  const filtersRef = useRef(filters);
  const sortByRef = useRef(sortBy);
  filtersRef.current = filters;
  sortByRef.current = sortBy;
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    void load(buildApiFilters(filtersRef.current, sortByRef.current));
  }, [language, load, buildApiFilters]);

  const openRecipe = useCallback(
    (id: string) => {
      router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: id } });
    },
    [router],
  );

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

  const nonCuisineFilterCount =
    filters.categories.length +
    filters.difficulties.length +
    (filters.maxTime > 0 ? 1 : 0);

  const effectiveSearch = isWebShell ? webSearchQuery : search;

  const filteredRecipes = useMemo(() => {
    if (state.status !== 'loaded') return [];
    const query = effectiveSearch.trim().toLowerCase();
    if (query.length === 0) return state.recipes;
    return state.recipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [state, effectiveSearch]);

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
    setFilters(emptyFilters);
    setPendingFilters(emptyFilters);
    void load();
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
    else if (key === 'profile') router.replace('/profile');
  };

  const toggleCuisineQuick = (cuisine: CuisineKey): void => {
    const next = {
      ...filters,
      cuisines: filters.cuisines.includes(cuisine)
        ? filters.cuisines.filter((x) => x !== cuisine)
        : [...filters.cuisines, cuisine],
    };
    setFilters(next);
    setPendingFilters(next);
    void load(buildApiFilters(next, sortBy));
  };

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => {
      if (gridColumns > 1) {
        return (
          <View style={styles.gridCell}>
            <RecipeListItem recipe={item} onPress={() => openRecipe(item.id)} />
          </View>
        );
      }
      return <RecipeListItem recipe={item} onPress={() => openRecipe(item.id)} />;
    },
    [openRecipe, gridColumns],
  );

  // ─── Sticky header (always visible, never scrolls away) ────────────────────
  // On the web shell the WebHeader already exposes a global search input, so
  // we drop the local SearchBar here and let users filter via WebShellState.
  const stickyHeader = (
    <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {isWebShell ? null : (
        <View style={styles.searchWrapper}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={t().recipes.searchPlaceholder}
          />
        </View>
      )}

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
          accessibilityRole="button"
          accessibilityLabel={t().recipes.filter}
        >
          <Ionicons
            name="funnel-outline"
            size={14}
            color={activeFilterCount > 0 ? colors.primaryText : colors.text}
          />
          <ThemedText
            variant="caption"
            style={[styles.pillLabel, { color: activeFilterCount > 0 ? colors.primaryText : colors.text }]}
          >
            {t().recipes.filter}
          </ThemedText>
          {activeFilterCount > 0 ? (
            <View style={[styles.pillBadge, { backgroundColor: colors.gradientBorder }]}>
              <ThemedText variant="caption" style={[styles.pillBadgeText, { color: colors.primaryText }]}>
                {activeFilterCount}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => setSheetOpen('sort')}
          style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={t().recipes.sortBy}
        >
          <Ionicons name="swap-vertical" size={14} color={colors.text} />
          <ThemedText variant="caption" style={[styles.pillLabel, { color: colors.text }]}>
            {sortLabels[sortBy]}
          </ThemedText>
        </Pressable>

        {state.status === 'loaded' ? (
          <ThemedText variant="caption" muted style={styles.countInline}>
            {filteredRecipes.length} {t().recipes.results}
          </ThemedText>
        ) : null}
      </View>

      {nonCuisineFilterCount > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeChipsScroll}
        >
          {filters.categories.map((c) => (
            <Pressable
              key={c}
              onPress={() => removeCategoryFilter(c)}
              style={[styles.activeChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}
              accessibilityRole="button"
              accessibilityLabel={`${formatLabel(c)} ${t().recipes.removeFilter}`}
            >
              <ThemedText variant="caption" style={[styles.activeChipText, { color: colors.primary }]}>
                {formatLabel(c)}
              </ThemedText>
              <Ionicons name="close-circle" size={14} color={colors.primary} />
            </Pressable>
          ))}
          {filters.difficulties.map((d) => (
            <Pressable
              key={d}
              onPress={() => removeDifficultyFilter(d)}
              style={[styles.activeChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}
              accessibilityRole="button"
              accessibilityLabel={`${formatLabel(d)} ${t().recipes.removeFilter}`}
            >
              <ThemedText variant="caption" style={[styles.activeChipText, { color: colors.primary }]}>
                {formatLabel(d)}
              </ThemedText>
              <Ionicons name="close-circle" size={14} color={colors.primary} />
            </Pressable>
          ))}
          {filters.maxTime > 0 ? (
            <Pressable
              onPress={removeMaxTimeFilter}
              style={[styles.activeChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}
              accessibilityRole="button"
              accessibilityLabel={t().recipes.removeTimeFilter}
            >
              <ThemedText variant="caption" style={[styles.activeChipText, { color: colors.primary }]}>
                ≤ {filters.maxTime} {t().recipes.minutes}
              </ThemedText>
              <Ionicons name="close-circle" size={14} color={colors.primary} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={resetFilters}
            style={[styles.activeChip, styles.clearChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel={t().recipes.clearFilters}
          >
            <ThemedText variant="caption" style={[styles.activeChipText, { color: colors.textMuted }]}>
              {t().recipes.clearFilters}
            </ThemedText>
          </Pressable>
        </ScrollView>
      ) : null}
    </View>
  );

  // ─── Body (varies by state) ─────────────────────────────────────────────────
  let body: React.JSX.Element;
  if (state.status === 'idle' || state.status === 'loading') {
    body = <LoadingSkeleton gridColumns={gridColumns} isWebShell={isWebShell} />;
  } else if (state.status === 'error') {
    const failure: Failure = state.failure;
    const content = failureContent(failure);
    body = (
      <ErrorState
        severity={failureSeverity(failure)}
        icon={failureIcon(failure)}
        title={content.title}
        body={content.body}
        primaryLabel={t().errors.retry}
        onPrimary={onRefresh}
      />
    );
  } else if (filteredRecipes.length === 0) {
    body = (
      <View style={styles.center}>
        {state.recipes.length === 0
          ? <MaterialCommunityIcons name="food-off" size={64} color={colors.textMuted} />
          : <Ionicons name="search" size={48} color={colors.textMuted} />
        }
        <ThemedText variant="body" muted style={styles.feedbackTitle}>
          {activeFilterCount > 0 || search.trim().length > 0
            ? t().recipes.noResults
            : t().recipes.empty}
        </ThemedText>
        <View style={styles.retryButton}>
          {activeFilterCount > 0 ? (
            <PrimaryButton label={t().recipes.clearFilters} onPress={resetFilters} />
          ) : (
            <PrimaryButton label={t().common.retry} onPress={onRefresh} />
          )}
        </View>
      </View>
    );
  } else {
    body = (
      <FlatList
        key={`grid-${gridColumns}`}
        data={filteredRecipes}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        numColumns={gridColumns}
        columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
        ItemSeparatorComponent={gridColumns === 1 ? ItemSeparator : undefined}
        contentContainerStyle={[
          styles.listContent,
          gridColumns > 1 ? styles.gridListContent : null,
        ]}
        style={[styles.list, isWebShell ? styles.listCenter : null]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <RecipesAppHeader onNotificationsPress={() => router.push('/notifications')} unreadCount={unreadCount} />
      {stickyHeader}

      {/* Always-visible header: stays stable while recipe list reloads */}
      <AiBannerCard onPress={() => router.push('/create-recipe')} />
      <CuisineStrip
        selectedCuisines={filters.cuisines}
        onToggle={toggleCuisineQuick}
      />

      <View style={styles.bodyContainer}>
        {body}
      </View>

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
          <PrimaryButton label={t().recipes.showResults} onPress={applyFilters} />
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
              accessibilityRole="menuitem"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // ─── Sticky header ──────────────────────────────────────────────────────────
  stickyHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...shadows.sm,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
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
  countInline: {
    marginLeft: 'auto',
    fontSize: fontSizes.small,
  },
  // Active filter chips — own full-width row
  activeChipsScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs2,
    alignItems: 'center',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: sizes.selectorHeight,
    paddingHorizontal: spacing.sm2,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  activeChipText: {
    fontWeight: '600',
    fontSize: fontSizes.small,
  },
  clearChip: {
    marginLeft: spacing.xs2,
  },
  // ─── Body ───────────────────────────────────────────────────────────────────
  bodyContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  listCenter: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  gridListContent: {
    paddingHorizontal: spacing.xl,
    gap: GRID_GAP,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  gridCell: {
    flex: 1,
    minWidth: 0,
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
  feedbackTitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  feedbackSub: {
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
  // ─── Filter bottom sheet ────────────────────────────────────────────────────
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
  // ─── Sort bottom sheet ──────────────────────────────────────────────────────
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
