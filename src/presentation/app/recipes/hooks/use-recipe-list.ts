import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Easing, useAnimatedScrollHandler, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { type Href, useFocusEffect, usePathname, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { useSaveRecipe } from '@presentation/app/recipes/shared/hooks/use-save-recipe';
import { SORT_TO_FILTER } from '@presentation/app/recipes/model/recipe-sort';
import type { SortKey } from '@presentation/app/recipes/model/sort-key';
import { useTaxonomyLabel } from '@presentation/app/recipes/shared/hooks/use-taxonomy-label';
import { useRefreshFailureToast } from '@presentation/app/recipes/hooks/use-refresh-failure-toast';
import { useGuestGate } from '@presentation/base/hooks/use-guest-gate';
import type { UiFilters } from '@presentation/app/recipes/model/ui-filters';
import { emptyFilters } from '@presentation/app/recipes/model/ui-filter-defaults';
import * as mutate from '@presentation/app/recipes/model/filter-mutations';
import type { UseRecipeListResult } from '@presentation/app/recipes/model/use-recipe-list-result';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useWebShellState } from '@presentation/base/responsive/use-web-shell-state';
import { t, useLocale } from '@presentation/i18n';
import { spacing, sizes } from '@presentation/base/theme';
import type { Difficulty } from '@domain/recipes/difficulty';
import type { RecipeFilters } from '@domain/recipes/recipe-filters';

const RECIPE_CARD_MIN_WIDTH = 320;
const GRID_GAP = spacing.lg2;
/** Snap/timing config for the mobile collapsing header band (Material small-top-app-bar feel). */
const HEADER_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) } as const;
/** Cumulative upward scroll (px) before the band is revealed again. */
const REVEAL_THRESHOLD = spacing.sm;

/**
 * Orchestrates the recipe-list screen: data load with locale/focus refetch,
 * filter + sort state (applied and pending), the mobile collapsing-header scroll
 * animation, and guest-gated save/create actions.
 */
export const useRecipeList = (): UseRecipeListResult => {
  const router = useRouter();
  const pathname = usePathname();
  const { recipeListStore, notificationsStore, savedRecipesStore, loadFavoritesUseCase, authStore } = useStores();
  const { isSaved, toggleSave } = useSaveRecipe();
  const userId = authStore((s) => (s.state.status === 'authenticated' ? s.state.session.user.id : null));
  const { promptVisible, promptMessage, requestGate, closePrompt } = useGuestGate(userId);
  const onGoToSignIn = useCallback(() => {
    closePrompt();
    router.push(`/login?redirect=${encodeURIComponent(pathname)}` as Href);
  }, [closePrompt, pathname, router]);
  // Guest-gated navigations: the create-recipe / AI-generate routes are auth-only,
  // so intercept the tap and surface the sign-in prompt instead of letting the
  // auth guard bounce the guest to a bare login screen.
  const onOpenCreate = useCallback(() => requestGate(() => router.push('/create-recipe')), [requestGate, router]);
  const { cuisineLabel } = useTaxonomyLabel();
  const unreadCount = notificationsStore((s) => s.unreadCount);
  const state = recipeListStore((s) => s.state);
  const load = recipeListStore((s) => s.load);
  const { isWebShell, width } = useLayout();
  const { searchQuery: webSearchQuery } = useWebShellState();
  const reduceMotion = useReducedMotion();
  // Subscribe to locale so the screen re-renders (and reloads) on a language switch.
  const language = useLocale();

  const [search, setSearch] = useState('');

  const scrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);
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
    // Snap the band to whichever edge is nearer when scrolling settles.
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

  const gridColumns = useMemo<number>(() => {
    if (!isWebShell) return 1;
    const available = Math.min(width, sizes.webContentMax) - spacing.xl * 2;
    return Math.max(1, Math.floor((available + GRID_GAP) / (RECIPE_CARD_MIN_WIDTH + GRID_GAP)));
  }, [isWebShell, width]);

  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [filters, setFilters] = useState<UiFilters>(emptyFilters);
  const [pendingFilters, setPendingFilters] = useState<UiFilters>(emptyFilters);
  const [pendingSort, setPendingSort] = useState<SortKey>('popular');
  const [sheetOpen, setSheetOpen] = useState<'filter' | null>(null);

  useEffect(() => {
    if (state.status === 'idle') void load();
  }, [state.status, load]);

  // Web home shows a Save bookmark on each card, so the saved set must be populated.
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

  // WHY: the store's `isRefreshing` covers every in-place refetch (filter, sort,
  // locale switch, focus), but `RefreshControl.refreshing` must reflect ONLY a
  // user-initiated pull: setting it programmatically on iOS calls
  // `UIRefreshControl.beginRefreshing`, which animates the scroll view down to
  // reveal the spinner and back when cleared — a visible jump on a filter tap.
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    void (async () => {
      try {
        await load(buildApiFilters(filters, sortBy));
      } catch {
        // `load` folds failures into state and shouldn't reject; swallow anyway so
        // an unexpected throw can't escape as an unhandled rejection.
      } finally {
        // Unconditional clear: never leave the spinner stuck. A late clear after
        // unmount is a harmless no-op, so this needs no mounted-ref guard.
        setIsPullRefreshing(false);
      }
    })();
  }, [load, filters, sortBy, buildApiFilters]);

  // Recipe content is localized server-side, so a language switch must re-fetch.
  // Refs keep the latest filters/sort without re-running this effect on their change.
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

  // Re-fetch quietly on focus so new/edited recipes appear; skip the mount focus.
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

  useRefreshFailureToast(state.status === 'loaded' ? state.refreshFailure : undefined);

  const onOpenRecipe = useCallback(
    (id: string) => router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: id } }),
    [router],
  );

  const applyAndLoad = useCallback(
    (next: UiFilters): void => {
      setFilters(next);
      setPendingFilters(next);
      void load(buildApiFilters(next, sortBy));
    },
    [load, buildApiFilters, sortBy],
  );

  const onApplyFilters = (): void => {
    // On mobile the sheet owns sort; on web sort is separate so pendingSort mirrors sortBy.
    const nextSort = isWebShell ? sortBy : pendingSort;
    setFilters(pendingFilters);
    setSortBy(nextSort);
    setSheetOpen(null);
    void load(buildApiFilters(pendingFilters, nextSort));
  };

  const onOpenFilter = (): void => {
    setPendingFilters(filters);
    setPendingSort(sortBy);
    setSheetOpen('filter');
  };

  const onResetFilters = (): void => {
    setFilters(emptyFilters);
    setPendingFilters(emptyFilters);
    void load();
  };

  const effectiveSearch = isWebShell ? webSearchQuery : search;
  const isSearching = effectiveSearch.trim().length > 0;

  const filteredRecipes = useMemo(() => {
    if (state.status !== 'loaded') return [];
    const query = effectiveSearch.trim().toLowerCase();
    if (query.length === 0) return state.recipes;
    return state.recipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [state, effectiveSearch]);

  return {
    state,
    filteredRecipes,
    isWebShell,
    isSearching,
    activeFilterCount: mutate.countActiveFilters(filters),
    gridColumns,
    sortBy,
    filters,
    activeCuisineLabel: filters.cuisines.length > 0 ? cuisineLabel(filters.cuisines[0]).name : null,
    unreadCount,
    scrollY,
    headerTranslateY,
    reduceMotion,
    scrollHandler,
    search,
    onSearchChange: setSearch,
    isPullRefreshing,
    onRefresh,
    onOpenRecipe,
    onOpenCreate,
    onNotifications: () => router.push('/notifications'),
    isSaved,
    onToggleSave: (id: string) => requestGate(() => void toggleSave(id), t().recipes.signInToSave),
    onChangeSort: (key: SortKey) => {
      setSortBy(key);
      void load(buildApiFilters(filters, key));
    },
    onToggleCuisineQuick: (cuisine: string) => applyAndLoad(mutate.toggleCuisineQuick(filters, cuisine)),
    onDifficultyChange: (d: Difficulty | null) => applyAndLoad(mutate.setDifficultyQuick(filters, d)),
    onRemoveCategory: (c: string) => applyAndLoad(mutate.removeCategory(filters, c)),
    onRemoveDifficulty: (d: Difficulty) => applyAndLoad(mutate.removeDifficulty(filters, d)),
    onRemoveMaxTime: () => applyAndLoad(mutate.removeMaxTime(filters)),
    onResetFilters,
    sheetOpen,
    pendingFilters,
    pendingSort,
    onOpenFilter,
    onCloseSheet: () => setSheetOpen(null),
    onSelectPendingSort: setPendingSort,
    onTogglePendingCuisine: (c: string) => setPendingFilters((f) => mutate.toggleCuisine(f, c)),
    onTogglePendingCategory: (c: string) => setPendingFilters((f) => mutate.toggleCategory(f, c)),
    onTogglePendingDifficulty: (d: Difficulty) => setPendingFilters((f) => mutate.toggleDifficulty(f, d)),
    onSetPendingMaxTime: (m: number) => setPendingFilters((f) => mutate.setMaxTime(f, m)),
    onApplyFilters,
    promptVisible,
    promptMessage,
    onClosePrompt: closePrompt,
    onGoToSignIn,
  };
};
