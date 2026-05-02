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
import { RecipeCard } from '@presentation/base/widgets/recipe-card';
import { SearchBar } from '@presentation/base/widgets/search-bar';
import { SkeletonCard } from '@presentation/base/widgets/skeleton-card';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { TabBar, type TabBarKey } from '@presentation/base/widgets/tab-bar';
import { BottomSheet } from '@presentation/base/widgets/bottom-sheet';
import { SelectChip } from '@presentation/base/widgets/select-chip';
import { useTheme } from '@presentation/base/theme/theme-context';
import { t } from '@presentation/i18n';
import { spacing, radii } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import type { Recipe } from '@domain/recipes/recipe';

type SortKey = 'popular' | 'rating' | 'timeAsc' | 'nameAsc';

interface Filters {
  cuisines: string[];
  difficulties: string[];
  maxTime: number;
}

const DIFFICULTIES: readonly string[] = ['Easy', 'Medium', 'Hard'];
const TIME_OPTIONS: readonly number[] = [0, 15, 30, 45, 60, 90];

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
  const [filters, setFilters] = useState<Filters>({
    cuisines: [],
    difficulties: [],
    maxTime: 0,
  });
  const [sheetOpen, setSheetOpen] = useState<'filter' | 'sort' | null>(null);

  useEffect(() => {
    if (state.status === 'idle') {
      void load();
    }
  }, [state.status, load]);

  const onRefresh = useCallback(() => {
    void load();
  }, [load]);

  const openRecipe = useCallback(
    (id: string) => {
      router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: id } });
    },
    [router],
  );

  const allCuisines = useMemo(() => {
    if (state.status !== 'loaded') return [];
    const set = new Set<string>();
    for (const r of state.recipes) set.add(r.cuisine);
    return Array.from(set).sort();
  }, [state]);

  const activeFilterCount =
    filters.cuisines.length + filters.difficulties.length + (filters.maxTime > 0 ? 1 : 0);

  const filteredRecipes = useMemo(() => {
    if (state.status !== 'loaded') return [];
    const query = search.trim().toLowerCase();
    let list = state.recipes.filter((r) =>
      query.length === 0 ? true : r.name.toLowerCase().includes(query),
    );
    if (filters.cuisines.length > 0) {
      list = list.filter((r) => filters.cuisines.includes(r.cuisine));
    }
    if (filters.difficulties.length > 0) {
      list = list.filter((r) => filters.difficulties.includes(r.difficulty));
    }
    if (filters.maxTime > 0) {
      list = list.filter(
        (r) => r.prepTimeMinutes + r.cookTimeMinutes <= filters.maxTime,
      );
    }
    const sorters: Record<SortKey, (a: Recipe, b: Recipe) => number> = {
      popular: (a, b) => b.rating - a.rating,
      rating: (a, b) => b.rating - a.rating,
      timeAsc: (a, b) =>
        a.prepTimeMinutes + a.cookTimeMinutes - (b.prepTimeMinutes + b.cookTimeMinutes),
      nameAsc: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(sorters[sortBy]);
  }, [state, search, filters, sortBy]);

  const sortLabels: Record<SortKey, string> = {
    popular: t().recipes.sortPopular,
    rating: t().recipes.sortRating,
    timeAsc: t().recipes.sortTime,
    nameAsc: t().recipes.sortName,
  };

  const toggleCuisine = (c: string): void =>
    setFilters((f) => ({
      ...f,
      cuisines: f.cuisines.includes(c)
        ? f.cuisines.filter((x) => x !== c)
        : [...f.cuisines, c],
    }));
  const toggleDifficulty = (d: string): void =>
    setFilters((f) => ({
      ...f,
      difficulties: f.difficulties.includes(d)
        ? f.difficulties.filter((x) => x !== d)
        : [...f.difficulties, d],
    }));
  const setMaxTime = (m: number): void => setFilters((f) => ({ ...f, maxTime: m }));
  const resetFilters = (): void =>
    setFilters({ cuisines: [], difficulties: [], maxTime: 0 });

  const onTabChange = (key: TabBarKey): void => {
    if (key === 'myRecipes') router.replace('/my-recipes');
    else if (key === 'settings') router.replace('/settings');
  };

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <RecipeCard
        name={item.name}
        image={item.image}
        cuisine={item.cuisine}
        difficulty={item.difficulty}
        rating={item.rating}
        tags={item.tags}
        onPress={() => openRecipe(item.id)}
      />
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
          onPress={() => setSheetOpen('filter')}
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
            <View style={styles.pillBadge}>
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
                onPress={() => toggleCuisine(c)}
                style={[styles.activeChip, { backgroundColor: colors.chipBackground }]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.activeChipText, { color: colors.chipText }]}
                >
                  {c} ×
                </ThemedText>
              </Pressable>
            ))}
            {filters.difficulties.map((d) => (
              <Pressable
                key={d}
                onPress={() => toggleDifficulty(d)}
                style={[styles.activeChip, { backgroundColor: colors.chipBackground }]}
              >
                <ThemedText
                  variant="caption"
                  style={[styles.activeChipText, { color: colors.chipText }]}
                >
                  {d} ×
                </ThemedText>
              </Pressable>
            ))}
            {filters.maxTime > 0 ? (
              <Pressable
                onPress={() => setMaxTime(0)}
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
        <View style={styles.center}>
          <MaterialCommunityIcons name="food-off" size={64} color={colors.textMuted} />
          <ThemedText variant="body" muted style={styles.errorTitle}>
            {t().recipes.empty}
          </ThemedText>
          <View style={styles.retryButton}>
            <PrimaryButton label={t().common.retry} onPress={onRefresh} />
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
        {allCuisines.length > 0 ? (
          <View style={styles.sheetSection}>
            <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
              {t().recipes.cuisine}
            </ThemedText>
            <View style={styles.chipsWrap}>
              {allCuisines.map((c) => (
                <SelectChip
                  key={c}
                  label={c}
                  selected={filters.cuisines.includes(c)}
                  onToggle={() => toggleCuisine(c)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sheetSection}>
          <ThemedText variant="label" muted style={styles.sheetSectionTitle}>
            {t().recipes.difficulty}
          </ThemedText>
          <View style={styles.chipsRow}>
            {DIFFICULTIES.map((d) => (
              <SelectChip
                key={d}
                label={d}
                selected={filters.difficulties.includes(d)}
                onToggle={() => toggleDifficulty(d)}
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
                selected={filters.maxTime === m}
                onToggle={() => setMaxTime(m)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetCta}>
          <PrimaryButton
            label={`${t().recipes.showResults} ${filteredRecipes.length}`}
            onPress={() => setSheetOpen(null)}
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
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radii.round,
    borderWidth: 1.5,
  },
  pillLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  pillBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeChipsRow: {
    gap: 6,
    alignItems: 'center',
    paddingRight: spacing.lg,
  },
  activeChip: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChipText: {
    fontWeight: '600',
    fontSize: 12,
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
    gap: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
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
    marginBottom: 4,
  },
});
