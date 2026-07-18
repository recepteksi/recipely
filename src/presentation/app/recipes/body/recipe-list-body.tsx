import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeListItem } from '@presentation/app/recipes/items/recipe-list-item';
import { RecipeSearchOverlay } from '@presentation/app/recipes/sheets/recipe-search-overlay';
import { RecipesAppHeader } from '@presentation/app/recipes/body/recipes-app-header';
import { CollapsingHomeHeader } from '@presentation/app/recipes/body/collapsing-home-header';
import { FilterSortFab } from '@presentation/app/recipes/items/filter-sort-fab';
import { WebHeroSection } from '@presentation/app/recipes/body/web-hero-section';
import { WebAiBanner } from '@presentation/app/recipes/items/web-ai-banner';
import { WebCuisineGrid } from '@presentation/app/recipes/body/web-cuisine-grid';
import { WebRecipeGrid } from '@presentation/app/recipes/body/web-recipe-grid';
import { LoadingSkeleton } from '@presentation/app/recipes/body/loading-skeleton';
import { MobileFeedHeader } from '@presentation/app/recipes/body/mobile-feed-header';
import { PrimaryButton } from '@presentation/base/widgets/buttons/primary-button';
import { ErrorState } from '@presentation/base/widgets/feedback/error-state';
import { failureContent, failureIcon, failureSeverity } from '@presentation/base/errors/failure-lookups';
import { isRecipeListRefreshing } from '@application/recipes/is-recipe-list-refreshing';
import type { UseRecipeListResult } from '@presentation/app/recipes/model/use-recipe-list-result';
import { useTheme } from '@presentation/base/theme/use-theme';
import { t } from '@presentation/i18n';
import { spacing, sizes } from '@presentation/base/theme';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

export interface RecipeListBodyProps {
  vm: UseRecipeListResult;
}

const ItemSeparator = (): React.JSX.Element => <View style={styles.separator} />;

/**
 * Renders the recipe-list shell (web app header + centered grid, or the mobile
 * collapsing-header feed) and the state-dependent body (error / loading / search
 * / empty / list). The filter sheets and sign-in prompt are rendered by the
 * screen alongside this.
 */
export const RecipeListBody = ({ vm }: RecipeListBodyProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { state, filteredRecipes, isWebShell, isSearching, gridColumns } = vm;

  const renderItem = ({ item }: { item: RecipeSummary }): React.JSX.Element => {
    if (gridColumns > 1) {
      return (
        <View style={styles.gridCell}>
          <RecipeListItem recipe={item} onPress={() => vm.onOpenRecipe(item.id)} />
        </View>
      );
    }
    return <RecipeListItem recipe={item} onPress={() => vm.onOpenRecipe(item.id)} />;
  };

  let body: React.JSX.Element;
  if (state.status === 'error') {
    const content = failureContent(state.failure);
    body = (
      <ErrorState
        severity={failureSeverity(state.failure)}
        icon={failureIcon(state.failure)}
        title={content.title}
        body={content.body}
        primaryLabel={t().errors.retry}
        onPrimary={vm.onRefresh}
      />
    );
  } else if (isWebShell) {
    body = (
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.webContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={vm.onRefresh} />}
      >
        {isSearching ? null : (
          <>
            <WebHeroSection onOpenRecipe={vm.onOpenRecipe} isSaved={vm.isSaved} onToggleSave={vm.onToggleSave} />
            <WebAiBanner onPress={vm.onOpenCreate} />
            <WebCuisineGrid selectedCuisines={vm.filters.cuisines} onToggle={vm.onToggleCuisineQuick} />
          </>
        )}
        <WebRecipeGrid
          recipes={filteredRecipes}
          isLoading={state.status !== 'loaded'}
          isRefreshing={isRecipeListRefreshing(state)}
          isSearching={isSearching}
          activeCuisineLabel={vm.activeCuisineLabel}
          sortBy={vm.sortBy}
          onChangeSort={vm.onChangeSort}
          onOpenFilter={vm.onOpenFilter}
          activeFilterCount={vm.activeFilterCount}
          activeDifficulty={vm.filters.difficulties[0] ?? null}
          onDifficultyChange={vm.onDifficultyChange}
          gridColumns={gridColumns}
          onOpenRecipe={vm.onOpenRecipe}
          isSaved={vm.isSaved}
          onToggleSave={vm.onToggleSave}
        />
      </ScrollView>
    );
  } else if (state.status === 'idle' || state.status === 'loading') {
    body = <LoadingSkeleton />;
  } else if (isSearching) {
    body = <RecipeSearchOverlay recipes={filteredRecipes} onOpenRecipe={vm.onOpenRecipe} />;
  } else if (filteredRecipes.length === 0) {
    body = (
      // A plain View accepts no pull gesture, and an empty list is exactly when
      // a user reaches for one — the ScrollView (with flexGrow content) gives
      // the refresh gesture a surface. No `progressViewOffset` here: the empty
      // branch renders inside `bodyTopInset`, which already pushes it below the
      // collapsing header band. `tintColor` (iOS) + `colors` (Android) theme it.
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl
            refreshing={vm.isPullRefreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.textMuted}
            colors={[colors.primary]}
          />
        }
      >
        <MaterialCommunityIcons name="food-off" size={64} color={colors.textMuted} />
        <ThemedText variant="body" muted style={styles.feedbackTitle}>
          {vm.activeFilterCount > 0 ? t().recipes.noResults : t().recipes.empty}
        </ThemedText>
        <View style={styles.retryButton}>
          {vm.activeFilterCount > 0 ? (
            <PrimaryButton label={t().recipes.clearFilters} onPress={vm.onResetFilters} />
          ) : (
            <PrimaryButton label={t().common.retry} onPress={vm.onRefresh} />
          )}
        </View>
      </ScrollView>
    );
  } else {
    body = (
      <Animated.FlatList
        data={filteredRecipes}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <MobileFeedHeader
            filters={vm.filters}
            resultCount={filteredRecipes.length}
            activeFilterCount={vm.activeFilterCount}
            onOpenCreate={vm.onOpenCreate}
            onToggleCuisine={vm.onToggleCuisineQuick}
            onRemoveCategory={vm.onRemoveCategory}
            onRemoveDifficulty={vm.onRemoveDifficulty}
            onRemoveMaxTime={vm.onRemoveMaxTime}
            onResetFilters={vm.onResetFilters}
          />
        }
        ItemSeparatorComponent={ItemSeparator}
        onScroll={vm.scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.listContent, styles.mobileListContent]}
        style={styles.list}
        refreshControl={
          // `progressViewOffset` drops the spinner below the collapsing header
          // band, which is absolutely positioned and opaque over the list — the
          // spinner would otherwise render behind it and be invisible.
          // `tintColor` is iOS-only and `colors` is Android-only; both are
          // needed for the spinner to follow the theme on each platform.
          <RefreshControl
            refreshing={vm.isPullRefreshing}
            onRefresh={vm.onRefresh}
            progressViewOffset={sizes.homeHeaderMax}
            tintColor={colors.textMuted}
            colors={[colors.primary]}
          />
        }
      />
    );
  }

  const isMobileLoadedFeed =
    !isWebShell && !isSearching && state.status === 'loaded' && filteredRecipes.length > 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {isWebShell ? (
        <>
          <RecipesAppHeader onNotificationsPress={vm.onNotifications} unreadCount={vm.unreadCount} />
          <View style={styles.bodyContainer}>{body}</View>
        </>
      ) : (
        <>
          <View style={[styles.bodyContainer, isMobileLoadedFeed ? null : styles.bodyTopInset]}>{body}</View>
          <CollapsingHomeHeader
            scrollY={vm.scrollY}
            headerTranslateY={vm.headerTranslateY}
            reduceMotion={vm.reduceMotion}
            onNotificationsPress={vm.onNotifications}
            unreadCount={vm.unreadCount}
            searchValue={vm.search}
            onSearchChange={vm.onSearchChange}
          />
          {state.status === 'loaded' ? (
            <FilterSortFab
              scrollY={vm.scrollY}
              reduceMotion={vm.reduceMotion}
              activeCount={vm.activeFilterCount}
              onPress={vm.onOpenFilter}
            />
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
  },
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
  mobileListContent: {
    paddingTop: sizes.homeHeaderMax,
    paddingBottom: sizes.fabExtendedHeight + spacing.xxl,
  },
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
  // flexGrow keeps the empty state pullable: the scroll content must fill the
  // viewport so the refresh gesture has a surface even with little rendered.
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  feedbackTitle: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
  },
});
