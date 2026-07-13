import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { ScreenContainer } from '@presentation/base/widgets/layout/screen-container';
import type { Tab } from '@presentation/app/my-recipes/model/tab';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { showErrorToast } from '@presentation/base/feedback/show-toast';
import { WebMyRecipesHeader } from '@presentation/app/my-recipes/body/web-my-recipes-header';
import { WebMyRecipesTabs } from '@presentation/app/my-recipes/body/web-my-recipes-tabs';
import { MyRecipesHeader } from '@presentation/app/my-recipes/body/my-recipes-header';
import { MyRecipesTabs } from '@presentation/app/my-recipes/body/my-recipes-tabs';
import { MyRecipesList } from '@presentation/app/my-recipes/body/my-recipes-list';
import { RECIPE_CARD_MIN_WIDTH, GRID_GAP } from '@presentation/app/my-recipes/model/grid-metrics';
import { useSaveRecipe } from '@presentation/app/recipes/shared/hooks/use-save-recipe';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { RecipeSummary } from '@domain/recipes/recipe-summary';

const WEB_CONTENT_MAX = 1200;

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
    const available = Math.min(width, WEB_CONTENT_MAX) - spacing.xl * 2;
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

  const tabDefs: readonly { key: Tab; label: string; count: number }[] = [
    { key: 'saved', label: t().myRecipes.saved, count: savedRecipes.length },
    { key: 'created', label: t().myRecipes.created, count: createdRecipes.length },
    { key: 'drafts', label: t().myRecipes.drafts, count: drafts.length },
  ];

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
            <MyRecipesHeader onCreate={openCreate} />
          )}

          {isWebShell ? (
            <View style={styles.webTabsWrap}>
              <WebMyRecipesTabs tabs={tabDefs} active={tab} onChange={(key) => setTab(key as Tab)} />
            </View>
          ) : (
            <MyRecipesTabs tabs={tabDefs} active={tab} onChange={setTab} />
          )}

          <MyRecipesList
            tab={tab}
            drafts={drafts}
            items={items}
            gridColumns={gridColumns}
            isWebShell={isWebShell}
            isSaved={isSaved}
            onToggleSave={(id) => void toggleSave(id)}
            onOpenRecipe={openRecipe}
            onOpenDraft={openDraft}
            onDeleteDraft={(id) => void deleteDraft(id)}
            onCreate={openCreate}
          />
        </ResponsiveContainer>
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
});

export default MyRecipesScreen;
