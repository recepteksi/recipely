import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedScrollHandler,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useFocusEffect, usePathname, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeListItem } from '@presentation/screens/recipes/list/items/recipe-list-item';
import { RecipeSearchOverlay } from '@presentation/screens/recipes/list/sheets/recipe-search-overlay';
import { RecipesAppHeader } from '@presentation/screens/recipes/list/body/recipes-app-header';
import { CollapsingHomeHeader } from '@presentation/screens/recipes/list/body/collapsing-home-header';
import { FilterSortFab } from '@presentation/screens/recipes/list/items/filter-sort-fab';
import { AiBannerCard } from '@presentation/screens/recipes/list/items/ai-banner-card';
import { CuisineStrip } from '@presentation/screens/recipes/list/body/cuisine-strip';
import { WebHeroSection } from '@presentation/screens/recipes/list/body/web-hero-section';
import { WebAiBanner } from '@presentation/screens/recipes/list/items/web-ai-banner';
import { WebCuisineGrid } from '@presentation/screens/recipes/list/body/web-cuisine-grid';
import { WebRecipeGrid } from '@presentation/screens/recipes/list/body/web-recipe-grid';
import { useSaveRecipe } from '@presentation/screens/recipes/shared/hooks/use-save-recipe';
import { SORT_TO_FILTER, sortKeyLabels } from '@presentation/screens/recipes/list/model/recipe-sort';
import type { SortKey } from '@presentation/screens/recipes/list/model/sort-key';
import { useTaxonomyLabel } from '@presentation/screens/recipes/shared/hooks/use-taxonomy-label';
import { useTaxonomyOptions } from '@presentation/screens/recipes/list/hooks/use-taxonomy-options';
import { SkeletonCard } from '@presentation/base/widgets/cards/skeleton-card';
import { PrimaryButton } from '@presentation/base/widgets/buttons/primary-button';
import { ErrorState } from '@presentation/base/widgets/feedback/error-state';
import { useRefreshFailureToast } from '@presentation/screens/recipes/list/hooks/use-refresh-failure-toast';
import {
  failureContent,
  failureIcon,
  failureSeverity,
} from '@presentation/base/errors/failure-lookups';
import { isRecipeListRefreshing } from '@application/recipes/is-recipe-list-refreshing';
import { TabBar } from '@presentation/base/widgets/navigation/tab-bar';
import type { TabBarKey } from '@presentation/base/widgets/navigation/tab-bar-key';
import { BottomSheet } from '@presentation/base/widgets/sheets/bottom-sheet';
import { SignInPromptSheet } from '@presentation/base/widgets/sheets/sign-in-prompt-sheet';
import { useGuestGate } from '@presentation/base/hooks/use-guest-gate';
import { WebFilterModal } from '@presentation/screens/recipes/list/sheets/web-filter-modal';
import type { UiFilters } from '@presentation/screens/recipes/list/model/ui-filters';
import { emptyFilters, TIME_OPTIONS } from '@presentation/screens/recipes/list/model/ui-filter-defaults';
import { SelectChip } from '@presentation/screens/recipes/list/items/select-chip';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useWebShellState } from '@presentation/base/responsive/use-web-shell-state';
import { useTheme } from '@presentation/base/theme/use-theme';
import { t, useLocale } from '@presentation/i18n';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';
import { DIFFICULTY_VALUES, type Difficulty } from '@domain/recipes/difficulty';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';

const RECIPE_CARD_MIN_WIDTH = 320;
const GRID_GAP = spacing.lg2;
/** Snap/timing config for the mobile collapsing header band (Material small-top-app-bar feel). */
const HEADER_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) } as const;
/** Cumulative upward scroll (px) before the band is revealed again. */
const REVEAL_THRESHOLD = spacing.sm;
/** Skeleton cards shown on mobile while the list loads. */
const SKELETON_CARD_COUNT = 4;

/** Formats a SCREAMING_SNAKE_CASE enum value to Title Case for display. */
const formatLabel = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ItemSeparator = (): React.JSX.Element => <View style={styles.separator} />;

/**
 * Mobile loading placeholder: a stacked single column of skeleton cards that
 * mirrors the non-web list. The web shell shimmers only its recipe grid
 * in-place (see {@link WebRecipeGrid}), so it never uses this full-screen view.
 */
const LoadingSkeleton = (): React.JSX.Element => (
  <ScrollView contentContainerStyle={styles.skeletonContainer}>
    {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </ScrollView>
);

export const RecipeListScreen = (): React.JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useTheme().colors;
  const { recipeListStore, notificationsStore, savedRecipesStore, loadFavoritesUseCase, authStore } = useStores();
  const { isSaved, toggleSave } = useSaveRecipe();
  const userId = authStore((s) => (s.state.status === 'authenticated' ? s.state.session.user.id : null));
  const { promptVisible, promptMessage, requestGate, closePrompt } = useGuestGate(userId);
  const goToSignIn = useCallback(() => {
    closePrompt();
    router.push(`/login?redirect=${encodeURIComponent(pathname)}` as Href);
  }, [closePrompt, pathname, router]);
  // Guest-gated navigations: the create-recipe / AI-generate routes are auth-only,
  // so intercept the tap and surface the sign-in prompt instead of letting the
  // auth guard bounce the guest to a bare login screen.
  const openCreateRecipe = useCallback(
    () => requestGate(() => router.push('/create-recipe')),
    [requestGate, router],
  );
  const { cuisineLabel, categoryLabel } = useTaxonomyLabel();
  const { cuisineKeys, categoryKeys } = useTaxonomyOptions();
  const unreadCount = notificationsStore((s) => s.unreadCount);
  const state = recipeListStore((s) => s.state);
  const load = recipeListStore((s) => s.load);
  const { isWebShell, width } = useLayout();
  const { searchQuery: webSearchQuery } = useWebShellState();
  const reduceMotion = useReducedMotion();
  // Subscribe to locale so the screen re-renders (and reloads, below) on a
  // language switch even while it sits back-stacked under Settings.
  const language = useLocale();

  const [search, setSearch] = useState('');

  // ─── Mobile collapsing-header scroll state (UI-thread shared values) ─────────
  // `scrollY` drives the title shrink / eyebrow fade / FAB morph; `headerTranslateY`
  // is the direction-aware band offset. `lastScrollY` tracks the previous offset so
  // the scroll handler can resolve direction. All ignored on the web shell.
  const scrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
  // 1 when the band is (heading) hidden, 0 when shown — guards against restarting
  // the timing animation on every frame while the direction is unchanged.
  const headerHidden = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      scrollY.value = y;
      if (reduceMotion) return;
      const delta = y - lastScrollY.value;
      if (y <= sizes.homeHeaderMax) {
        if (headerHidden.value !== 0) {
          headerHidden.value = 0;
          headerTranslateY.value = withTiming(0, HEADER_TIMING);
        }
      } else if (delta > 0 && headerHidden.value !== 1) {
        headerHidden.value = 1;
        headerTranslateY.value = withTiming(-sizes.homeHeaderMax, HEADER_TIMING);
      } else if (delta < -REVEAL_THRESHOLD && headerHidden.value !== 0) {
        headerHidden.value = 0;
        headerTranslateY.value = withTiming(0, HEADER_TIMING);
      }
      lastScrollY.value = y;
    },
    // Snap the band to whichever edge is nearer when scrolling settles, so it is
    // never left half-shown (Material small-top-app-bar resolution).
    onMomentumEnd: () => {
      if (reduceMotion) return;
      const hide = headerTranslateY.value < -sizes.homeHeaderMax / 2;
      headerHidden.value = hide ? 1 : 0;
      headerTranslateY.value = withTiming(hide ? -sizes.homeHeaderMax : 0, HEADER_TIMING);
    },
    onEndDrag: () => {
      if (reduceMotion) return;
      const hide = headerTranslateY.value < -sizes.homeHeaderMax / 2;
      headerHidden.value = hide ? 1 : 0;
      headerTranslateY.value = withTiming(hide ? -sizes.homeHeaderMax : 0, HEADER_TIMING);
    },
  });

  // Grid columns: 1 on mobile, auto-fill at RECIPE_CARD_MIN_WIDTH on web shell,
  // capped to the centered 1200px content max so cards stay readable.
  const gridColumns = useMemo<number>(() => {
    if (!isWebShell) return 1;
    const available = Math.min(width, sizes.webContentMax) - spacing.xl * 2;
    return Math.max(1, Math.floor((available + GRID_GAP) / (RECIPE_CARD_MIN_WIDTH + GRID_GAP)));
  }, [isWebShell, width]);
  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [filters, setFilters] = useState<UiFilters>(emptyFilters);
  const [pendingFilters, setPendingFilters] = useState<UiFilters>(emptyFilters);
  // On mobile, sort lives inside the filter sheet and is applied together with
  // the filters via "Show results"; `pendingSort` holds the in-sheet selection.
  const [pendingSort, setPendingSort] = useState<SortKey>('popular');
  const [sheetOpen, setSheetOpen] = useState<'filter' | null>(null);

  useEffect(() => {
    if (state.status === 'idle') {
      void load();
    }
  }, [state.status, load]);

  // Web home shows a Save bookmark on each card, so the saved set must be
  // populated (mobile drives saving from the detail screen instead).
  useEffect(() => {
    if (!isWebShell) return;
    void loadFavoritesUseCase.execute().then((result) => {
      if (result.ok) savedRecipesStore.getState().setSavedIds(result.value);
    });
  }, [isWebShell, loadFavoritesUseCase, savedRecipesStore]);

  const buildApiFilters = useCallback(
    (f: UiFilters, sort: SortKey): RecipeFilters => ({
      ...(f.cuisines.length > 0 ? { cuisines: f.cuisines } : {}),
      ...(f.categories.length > 0 ? { categories: f.categories } : {}),
      ...(f.difficulties.length > 0 ? { difficulties: f.difficulties } : {}),
      ...(f.maxTime > 0 ? { maxTime: f.maxTime } : {}),
      sort: SORT_TO_FILTER[sort],
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

  // Re-fetch quietly whenever the screen regains focus (e.g. returning from
  // create-recipe or a detail page) so new/edited recipes appear without a
  // manual pull-to-refresh. The store refreshes in place (`isRefreshing`), so
  // the visible list never blanks. The first focus fires on mount, where the
  // initial load is already underway — skip it to avoid a duplicate fetch.
  const didFocusRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!didFocusRef.current) {
        didFocusRef.current = true;
        return;
      }
      void load(buildApiFilters(filtersRef.current, sortByRef.current));
    }, [load, buildApiFilters]),
  );

  // Surfaces a failed filter/sort refetch as a toast (the stale list stays on
  // screen per the store's design) — see `useRefreshFailureToast` for the
  // once-per-occurrence transition guard.
  useRefreshFailureToast(state.status === 'loaded' ? state.refreshFailure : undefined);

  const openRecipe = useCallback(
    (id: string) => {
      router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: id } });
    },
    [router],
  );

  const applyFilters = (): void => {
    // On mobile the sheet also owns sort, so apply the pending sort alongside the
    // filters. On web sort is a separate sheet, so `pendingSort` mirrors `sortBy`.
    const nextSort = isWebShell ? sortBy : pendingSort;
    setFilters(pendingFilters);
    setSortBy(nextSort);
    setSheetOpen(null);
    void load(buildApiFilters(pendingFilters, nextSort));
  };

  const openFilterSheet = (): void => {
    setPendingFilters(filters);
    setPendingSort(sortBy);
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
  // Searching hides the editorial hero / banner / cuisine sections (web) or
  // swaps the whole body for a dedicated results surface (mobile) — see the
  // `isSearching` body branch below and `RecipeSearchOverlay`.
  const isSearching = effectiveSearch.trim().length > 0;

  const filteredRecipes = useMemo(() => {
    if (state.status !== 'loaded') return [];
    const query = effectiveSearch.trim().toLowerCase();
    if (query.length === 0) return state.recipes;
    return state.recipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [state, effectiveSearch]);

  const sortLabels = sortKeyLabels();

  const togglePendingCuisine = (c: string): void =>
    setPendingFilters((f) => ({
      ...f,
      cuisines: f.cuisines.includes(c) ? f.cuisines.filter((x) => x !== c) : [...f.cuisines, c],
    }));

  const togglePendingCategory = (c: string): void =>
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

  const removeCategoryFilter = (c: string): void => {
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

  const toggleCuisineQuick = (cuisine: string): void => {
    // The web cuisine grid's "All" tile sends the 'ALL' sentinel to clear the
    // cuisine filter; real cuisine keys toggle as on mobile.
    const nextCuisines =
      cuisine === 'ALL'
        ? []
        : filters.cuisines.includes(cuisine)
          ? filters.cuisines.filter((x) => x !== cuisine)
          : [...filters.cuisines, cuisine];
    const next = { ...filters, cuisines: nextCuisines };
    setFilters(next);
    setPendingFilters(next);
    void load(buildApiFilters(next, sortBy));
  };

  // Web difficulty segmented control: single-select replaces the difficulty set
  // (`null` clears it), driving the same `filters.difficulties` flow.
  const setDifficultyQuick = (d: Difficulty | null): void => {
    const next = { ...filters, difficulties: d ? [d] : [] };
    setFilters(next);
    setPendingFilters(next);
    void load(buildApiFilters(next, sortBy));
  };

  const renderItem = useCallback(
    ({ item }: { item: RecipeSummary }) => {
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

  // ─── Active-filter chips row ────────────────────────────────────────────────
  // Removable chips for every applied non-cuisine filter, plus a "Clear all" link.
  // Shared between the web sticky header and the mobile scrolling list header.
  const activeChipsRow =
    nonCuisineFilterCount > 0 ? (
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
            accessibilityLabel={`${categoryLabel(c).name} ${t().recipes.removeFilter}`}
          >
            <ThemedText variant="caption" style={[styles.activeChipText, { color: colors.primary }]}>
              {categoryLabel(c).name}
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
    ) : null;

  // ─── Mobile scrolling list header (everything that scrolls away with the feed) ─
  // Ai promo, cuisine strip, result-count + Clear-all row, and the active-filter
  // chips row — all inside the FlatList header so they scroll under the band.
  // Negative horizontal margin cancels the list content's `spacing.lg` padding so
  // the banner / cuisine strip / chips render full-bleed (as on web), while the
  // recipe rows below keep that padding. The count row re-adds its own inset.
  const mobileListHeader = (
    <View style={styles.mobileHeaderBleed}>
      <AiBannerCard onPress={openCreateRecipe} />
      <CuisineStrip selectedCuisines={filters.cuisines} onToggle={toggleCuisineQuick} />
      <View style={styles.countRow}>
        <ThemedText variant="caption" muted>
          {filteredRecipes.length} {t().recipes.results}
        </ThemedText>
        {activeFilterCount > 0 ? (
          <Pressable
            onPress={resetFilters}
            accessibilityRole="button"
            accessibilityLabel={t().recipes.clearFilters}
          >
            <ThemedText variant="caption" style={{ color: colors.primary }}>
              {t().recipes.clearFilters}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {activeChipsRow}
    </View>
  );

  // ─── Body (varies by state) ─────────────────────────────────────────────────
  let body: React.JSX.Element;
  if (state.status === 'error') {
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
  } else if (isWebShell) {
    // Web owns its own loading: the hero / banner / cuisine sections (driven by
    // a separate store + static data) and the grid's section head with its
    // sort/filter controls stay mounted while only the grid area shimmers — so
    // a sort/filter change never blanks the whole page. The grid also renders
    // its own empty state inline, keeping those sections visible at zero results.
    body = (
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.webContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
      >
        {isSearching ? null : (
          <>
            <WebHeroSection
              onOpenRecipe={openRecipe}
              isSaved={isSaved}
              onToggleSave={(id) => requestGate(() => void toggleSave(id), t().recipes.signInToSave)}
            />
            <WebAiBanner onPress={openCreateRecipe} />
            <WebCuisineGrid selectedCuisines={filters.cuisines} onToggle={toggleCuisineQuick} />
          </>
        )}
        <WebRecipeGrid
          recipes={filteredRecipes}
          isLoading={state.status !== 'loaded'}
          isRefreshing={isRecipeListRefreshing(state)}
          isSearching={isSearching}
          activeCuisineLabel={
            filters.cuisines.length > 0 ? cuisineLabel(filters.cuisines[0]).name : null
          }
          sortBy={sortBy}
          onChangeSort={(key) => {
            setSortBy(key);
            void load(buildApiFilters(filters, key));
          }}
          onOpenFilter={openFilterSheet}
          activeFilterCount={activeFilterCount}
          activeDifficulty={filters.difficulties[0] ?? null}
          onDifficultyChange={setDifficultyQuick}
          gridColumns={gridColumns}
          onOpenRecipe={openRecipe}
          isSaved={isSaved}
          onToggleSave={(id) => requestGate(() => void toggleSave(id), t().recipes.signInToSave)}
        />
      </ScrollView>
    );
  } else if (state.status === 'idle' || state.status === 'loading') {
    // Mobile first/refresh load: full-screen stacked skeleton.
    body = <LoadingSkeleton />;
  } else if (isSearching) {
    // Mobile: dedicated search-results surface. Replaces the AI banner / cuisine
    // strip / normal grid entirely so results render directly under the sticky
    // search bar instead of requiring a scroll past unrelated sections (also
    // owns its own zero-results empty state).
    body = <RecipeSearchOverlay recipes={filteredRecipes} onOpenRecipe={openRecipe} />;
  } else if (filteredRecipes.length === 0) {
    body = (
      <View style={styles.center}>
        <MaterialCommunityIcons name="food-off" size={64} color={colors.textMuted} />
        <ThemedText variant="body" muted style={styles.feedbackTitle}>
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
    );
  } else {
    // Mobile: single scroll surface. The feed header (banner/cuisines/count/chips)
    // scrolls with the rows; top padding clears the resting collapsing band.
    body = (
      <Animated.FlatList
        data={filteredRecipes}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        ListHeaderComponent={mobileListHeader}
        ItemSeparatorComponent={ItemSeparator}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.listContent, styles.mobileListContent]}
        style={styles.list}
        refreshControl={<RefreshControl refreshing={isRecipeListRefreshing(state)} onRefresh={onRefresh} />}
      />
    );
  }

  // The mobile loaded feed embeds its own header (banner/cuisines/count/chips) and
  // sits under the collapsing band; the other states — including the search
  // overlay, which needs to clear the band itself — render below the band via
  // bodyTopInset so they're never hidden behind it.
  const isMobileLoadedFeed =
    !isWebShell && !isSearching && state.status === 'loaded' && filteredRecipes.length > 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {isWebShell ? (
        <>
          <RecipesAppHeader
            onNotificationsPress={() => router.push('/notifications')}
            unreadCount={unreadCount}
          />

          {/* Hero / banner / cuisine grid + recipe grid live inside `body`'s
              centered web column (see the isWebShell body branch). */}
          <View style={styles.bodyContainer}>{body}</View>
        </>
      ) : (
        <>
          <View style={[styles.bodyContainer, isMobileLoadedFeed ? null : styles.bodyTopInset]}>
            {body}
          </View>
          <CollapsingHomeHeader
            scrollY={scrollY}
            headerTranslateY={headerTranslateY}
            reduceMotion={reduceMotion}
            onNotificationsPress={() => router.push('/notifications')}
            unreadCount={unreadCount}
            searchValue={search}
            onSearchChange={setSearch}
          />
          {state.status === 'loaded' ? (
            <FilterSortFab
              scrollY={scrollY}
              reduceMotion={reduceMotion}
              activeCount={activeFilterCount}
              onPress={openFilterSheet}
            />
          ) : null}
        </>
      )}

      {/* Mobile filter bottom sheet (web uses the centered WebFilterModal below). */}
      <BottomSheet
        visible={!isWebShell && sheetOpen === 'filter'}
        title={t().recipes.filter}
        onClose={() => setSheetOpen(null)}
        rightAction={
          activeFilterCount > 0
            ? { label: t().recipes.clearFilters, onPress: resetFilters }
            : undefined
        }
      >
        {isWebShell ? null : (
          <View style={styles.sheetSection}>
            <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
              {t().recipes.sortBy}
            </ThemedText>
            <View style={styles.chipsWrap}>
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <SelectChip
                  key={key}
                  label={sortLabels[key]}
                  selected={pendingSort === key}
                  onToggle={() => setPendingSort(key)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.sheetSection}>
          <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
            {t().recipes.cuisine}
          </ThemedText>
          <View style={styles.chipsWrap}>
            {cuisineKeys.map((c) => (
              <SelectChip
                key={c}
                label={cuisineLabel(c).name}
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
            {categoryKeys.map((c) => (
              <SelectChip
                key={c}
                label={categoryLabel(c).name}
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

      {/* Web filter dialog — centered modal; mobile uses the bottom sheet above. */}
      <WebFilterModal
        visible={isWebShell && sheetOpen === 'filter'}
        pending={pendingFilters}
        resultCount={filteredRecipes.length}
        hasActiveFilters={
          pendingFilters.cuisines.length +
            pendingFilters.categories.length +
            pendingFilters.difficulties.length +
            (pendingFilters.maxTime > 0 ? 1 : 0) >
          0
        }
        onToggleCuisine={togglePendingCuisine}
        onToggleCategory={togglePendingCategory}
        onToggleDifficulty={togglePendingDifficulty}
        onSetMaxTime={setPendingMaxTime}
        onApply={applyFilters}
        onReset={resetFilters}
        onClose={() => setSheetOpen(null)}
      />

      <SignInPromptSheet
        visible={promptVisible}
        onClose={closePrompt}
        onSignIn={goToSignIn}
        message={promptMessage}
      />

      <TabBar active="recipes" onChange={onTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  // Pushes the non-feed mobile states (skeleton / error / empty) below the band.
  bodyTopInset: {
    paddingTop: sizes.homeHeaderMax,
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
  // Mobile feed: clear the resting collapsing band; the FAB clears the TabBar.
  mobileListContent: {
    paddingTop: sizes.homeHeaderMax,
    paddingBottom: sizes.tabBarHeight + sizes.fabExtendedHeight + spacing.xxl,
  },
  // Cancels the list content's horizontal padding so the feed header is full-bleed.
  mobileHeaderBleed: {
    marginHorizontal: -spacing.lg,
  },
  // Result-count + Clear-all row inside the mobile list header (re-adds the inset).
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  // Centered web home column wrapping the hero / banner / cuisine + recipe grid.
  webContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: sizes.webContentMax,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
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
});
