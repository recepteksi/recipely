import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ScreenContainer } from '@presentation/base/widgets/layout/screen-container';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipeCard } from '@presentation/base/widgets/cards/recipe-card';
import { PrimaryButton } from '@presentation/base/widgets/buttons/primary-button';
import { TabBar } from '@presentation/base/widgets/navigation/tab-bar';
import type { TabBarKey } from '@presentation/base/widgets/navigation/tab-bar-key';
import type { Tab } from '@presentation/app/my-recipes/model/tab';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { showErrorToast } from '@presentation/base/feedback/show-toast';
import { DraftCard } from '@presentation/app/my-recipes/items/draft-card';
import { WebMyRecipesHeader } from '@presentation/app/my-recipes/body/web-my-recipes-header';
import { WebMyRecipesTabs } from '@presentation/app/my-recipes/body/web-my-recipes-tabs';
import { WebRecipeCard } from '@presentation/app/recipes/items/web-recipe-card';
import { useSaveRecipe } from '@presentation/app/recipes/shared/hooks/use-save-recipe';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { t } from '@presentation/i18n';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

const RECIPE_CARD_MIN_WIDTH = 320;
const GRID_GAP = spacing.lg2;

export const MyRecipesScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { isWebShell, width } = useLayout();
  const { recipeListStore, savedRecipesStore, createdRecipesStore, draftsStore, loadFavoritesUseCase } = useStores();
  const { isSaved, toggleSave } = useSaveRecipe();

  const recipeListState = recipeListStore((s) => s.state);
  const loadRecipes = recipeListStore((s) => s.load);
  const savedIds = savedRecipesStore((s) => s.savedIds);
  const createdRecipes = createdRecipesStore((s) => s.recipes);
  const drafts = draftsStore((s) => s.drafts);

  const [tab, setTab] = useState<Tab>('saved');

  // Grid columns: 1 on mobile, auto-fill at RECIPE_CARD_MIN_WIDTH on web shell.
  const gridColumns = useMemo<number>(() => {
    if (!isWebShell) return 1;
    const available = Math.min(width, 1200) - spacing.xl * 2;
    return Math.max(1, Math.floor((available + GRID_GAP) / (RECIPE_CARD_MIN_WIDTH + GRID_GAP)));
  }, [isWebShell, width]);

  useEffect(() => {
    if (recipeListState.status === 'idle') {
      void loadRecipes();
    }
  }, [recipeListState.status, loadRecipes]);

  useEffect(() => {
    const loadSavedRecipes = async () => {
      const result = await loadFavoritesUseCase.execute();
      if (result.ok) {
        const { setSavedIds } = savedRecipesStore.getState();
        setSavedIds(result.value);
      }
    };
    void loadSavedRecipes();
    void createdRecipesStore.getState().loadMyRecipes();
    void draftsStore.getState().loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedRecipes = useMemo(() => {
    const all: readonly RecipeSummary[] =
      recipeListState.status === 'loaded' ? recipeListState.recipes : [];
    return all.filter((r) => savedIds.has(r.id));
  }, [recipeListState, savedIds]);

  const items = tab === 'saved' ? savedRecipes : createdRecipes;

  const onTabChange = (key: TabBarKey): void => {
    if (key === 'recipes') router.replace('/recipes');
    else if (key === 'profile') router.replace('/profile');
  };

  const openRecipe = (id: string): void => {
    router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: id } });
  };

  const openCreate = (): void => {
    router.push('/create-recipe');
  };

  const openDraft = (id: string): void => {
    router.push({ pathname: '/create-recipe', params: { draftId: id } });
  };

  const deleteDraft = async (id: string): Promise<void> => {
    const result = await draftsStore.getState().deleteDraft(id);
    if (!result.ok) showErrorToast(result.failure);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenContainer scrollable={false} padded={false}>
        <ResponsiveContainer route="myRecipes" gutter={false} fill>
        {isWebShell ? (
          <View style={styles.webHeaderWrap}>
            <WebMyRecipesHeader onCreate={openCreate} />
          </View>
        ) : (
          <View style={styles.header}>
            <ThemedText variant="title">{t().myRecipes.title}</ThemedText>
            <View style={styles.headerActions}>
              <Pressable
                onPress={openCreate}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.createButton,
                  shadows.sm,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons name="add" size={16} color={colors.primaryText} />
                <ThemedText
                  variant="caption"
                  style={[styles.createLabel, { color: colors.primaryText }]}
                >
                  {t().myRecipes.createNew}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {isWebShell ? (
          <View style={styles.webTabsWrap}>
            <WebMyRecipesTabs
              tabs={[
                { key: 'saved', label: t().myRecipes.saved, count: savedRecipes.length },
                { key: 'created', label: t().myRecipes.created, count: createdRecipes.length },
                { key: 'drafts', label: t().myRecipes.drafts, count: drafts.length },
              ]}
              active={tab}
              onChange={(key) => setTab(key as Tab)}
            />
          </View>
        ) : (
        <View
          style={[
            styles.segmented,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          ]}
        >
          {(
            [
              ['saved', t().myRecipes.saved, savedRecipes.length],
              ['created', t().myRecipes.created, createdRecipes.length],
              ['drafts', t().myRecipes.drafts, drafts.length],
            ] as const
          ).map(([key, label, count]) => {
            const isActive = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key as Tab)}
                accessibilityRole="button"
                accessibilityLabel={label}
                style={[
                  styles.segment,
                  { backgroundColor: isActive ? colors.primary : 'transparent' },
                ]}
              >
                <ThemedText
                  variant="caption"
                  numberOfLines={1}
                  style={[
                    styles.segmentLabel,
                    { color: isActive ? colors.primaryText : colors.text },
                  ]}
                >
                  {label}
                </ThemedText>
                <View
                  style={[
                    styles.countPill,
                    {
                      backgroundColor: isActive
                        ? colors.gradientBorder
                        : colors.chipBackground,
                    },
                  ]}
                >
                  <ThemedText
                    variant="caption"
                    style={[
                      styles.countText,
                      { color: isActive ? colors.primaryText : colors.chipText },
                    ]}
                  >
                    {count}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
        )}

        {tab === 'drafts' ? (
          drafts.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={56} color={colors.textMuted} />
              <ThemedText variant="body" muted style={styles.emptyText}>
                {t().drafts.empty}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={drafts}
              keyExtractor={(d) => d.id}
              renderItem={({ item }) => (
                <DraftCard
                  draft={item}
                  onOpen={() => openDraft(item.id)}
                  onDelete={() => void deleteDraft(item.id)}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
              style={styles.list}
            />
          )
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name={tab === 'saved' ? 'bookmark-outline' : 'silverware-fork-knife'}
              size={56}
              color={colors.textMuted}
            />
            <ThemedText variant="body" muted style={styles.emptyText}>
              {tab === 'saved' ? t().myRecipes.emptySaved : t().myRecipes.emptyCreated}
            </ThemedText>
            {tab === 'created' ? (
              <View style={styles.emptyAction}>
                <PrimaryButton label={t().myRecipes.createNew} onPress={openCreate} />
              </View>
            ) : null}
          </View>
        ) : (
          <FlatList
            key={`grid-${gridColumns}`}
            data={items as RecipeSummary[]}
            keyExtractor={(r) => r.id}
            numColumns={gridColumns}
            renderItem={({ item }) => (
              <View style={gridColumns > 1 ? styles.gridCell : null}>
                {isWebShell ? (
                  <WebRecipeCard
                    recipe={item}
                    saved={isSaved(item.id)}
                    onOpen={openRecipe}
                    onToggleSave={(id) => void toggleSave(id)}
                    ownedByMe={tab === 'created'}
                  />
                ) : (
                  <RecipeCard
                    name={item.name}
                    image={item.image}
                    cuisine={item.cuisine}
                    difficulty={item.difficulty}
                    rating={item.rating}
                    onPress={() => openRecipe(item.id)}
                  />
                )}
              </View>
            )}
            columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
            ItemSeparatorComponent={gridColumns === 1 ? () => <View style={styles.separator} /> : undefined}
            contentContainerStyle={[
              styles.listContent,
              gridColumns > 1 ? styles.gridContent : null,
            ]}
            style={styles.list}
          />
        )}
        </ResponsiveContainer>
      </ScreenContainer>

      <TabBar active="myRecipes" onChange={onTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  // Web band + underlined tabs share the list's horizontal inset so they line
  // up with the recipe grid below; top padding clears the web app header.
  webHeaderWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  webTabsWrap: {
    paddingHorizontal: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs2,
    height: sizes.floatingBtn,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
  },
  createLabel: {
    fontWeight: '600',
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.xs,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  segment: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: 0,
    height: sizes.iconBtn,
    paddingHorizontal: spacing.xs2,
    borderRadius: radii.round,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  segmentLabel: {
    fontWeight: '600',
    fontSize: fontSizes.small,
    flexShrink: 1,
    minWidth: 0,
  },
  countPill: {
    minWidth: sizes.iconMd,
    height: sizes.iconXxs,
    paddingHorizontal: spacing.xs2,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  countText: {
    fontWeight: '700',
    fontSize: fontSizes.micro,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  list: {
    flex: 1,
  },
  separator: {
    height: spacing.md,
  },
  gridRow: {
    gap: GRID_GAP,
    paddingHorizontal: spacing.lg,
  },
  gridContent: {
    paddingHorizontal: 0,
    paddingTop: spacing.md,
    gap: GRID_GAP,
  },
  gridCell: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.sm,
    width: '100%',
    maxWidth: 240,
  },
});

export default MyRecipesScreen;
