import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipeCard } from '@presentation/base/widgets/recipe-card';
import { SearchBar } from '@presentation/base/widgets/search-bar';
import { SkeletonLoader } from '@presentation/base/widgets/skeleton-loader';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { useTheme } from '@presentation/base/theme/theme-context';
import { t } from '@presentation/i18n';
import { spacing, radii } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import type { Recipe } from '@domain/recipes/recipe';

const ItemSeparator = (): React.JSX.Element => <View style={styles.separator} />;

const LoadingSkeleton = (): React.JSX.Element => (
  <ScrollView contentContainerStyle={styles.skeletonContainer}>
    {Array.from({ length: 3 }, (_, i) => (
      <View key={i} style={styles.skeletonCard}>
        <SkeletonLoader width="100%" height={180} borderRadius={radii.xl} />
        <View style={styles.skeletonLines}>
          <SkeletonLoader width="60%" height={18} borderRadius={radii.sm} />
          <SkeletonLoader width="40%" height={14} borderRadius={radii.sm} style={styles.skeletonLine2} />
        </View>
      </View>
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
      router.push(`/recipes/${id}`);
    },
    [router],
  );

  const filteredRecipes = useMemo(() => {
    if (state.status !== 'loaded') return [];
    if (search.trim().length === 0) return state.recipes;
    const query = search.toLowerCase();
    return state.recipes.filter((r) => r.name.toLowerCase().includes(query));
  }, [state, search]);

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

  const listHeader = useMemo(
    () => (
      <View style={styles.searchWrapper}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={t().recipes.searchPlaceholder}
        />
      </View>
    ),
    [search],
  );

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <ScreenContainer padded={false}>
        <LoadingSkeleton />
      </ScreenContainer>
    );
  }

  if (state.status === 'error') {
    const failure: Failure = state.failure;
    return (
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
  }

  if (state.status === 'loaded' && filteredRecipes.length === 0 && search.trim().length > 0) {
    return (
      <ScreenContainer padded={false}>
        <View style={styles.listContent}>
          {listHeader}
        </View>
        <View style={styles.center}>
          <MaterialCommunityIcons name="food-off" size={64} color={colors.textMuted} />
          <ThemedText variant="body" muted style={styles.errorTitle}>
            {t().recipes.noResults}
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  if (state.status === 'loaded' && state.recipes.length === 0) {
    return (
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
  }

  return (
    <ScreenContainer padded={false}>
      <FlatList
        data={filteredRecipes}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchWrapper: {
    paddingVertical: spacing.md,
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
  skeletonCard: {
    gap: spacing.sm,
  },
  skeletonLines: {
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  skeletonLine2: {
    marginTop: spacing.xs,
  },
});
