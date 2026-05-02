import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { RecipeCard } from '@presentation/base/widgets/recipe-card';
import { PrimaryButton } from '@presentation/base/widgets/primary-button';
import { TabBar, type TabBarKey } from '@presentation/base/widgets/tab-bar';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { t } from '@presentation/i18n';
import type { Recipe } from '@domain/recipes/recipe';

type Tab = 'saved' | 'created';

export const MyRecipesScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const { recipeListStore, savedRecipesStore, createdRecipesStore } = useStores();

  const recipeListState = recipeListStore((s) => s.state);
  const loadRecipes = recipeListStore((s) => s.load);
  const savedIds = savedRecipesStore((s) => s.savedIds);
  const createdRecipes = createdRecipesStore((s) => s.recipes);

  const [tab, setTab] = useState<Tab>('saved');

  useEffect(() => {
    if (recipeListState.status === 'idle') {
      void loadRecipes();
    }
  }, [recipeListState.status, loadRecipes]);

  const savedRecipes = useMemo(() => {
    const all: readonly Recipe[] =
      recipeListState.status === 'loaded' ? recipeListState.recipes : [];
    return all.filter((r) => savedIds.has(r.id));
  }, [recipeListState, savedIds]);

  const items = tab === 'saved' ? savedRecipes : createdRecipes;

  const onTabChange = (key: TabBarKey): void => {
    if (key === 'recipes') router.replace('/recipes');
    else if (key === 'settings') router.replace('/settings');
  };

  const openRecipe = (id: string): void => {
    router.push({ pathname: '/recipes/[recipeId]', params: { recipeId: id } });
  };

  const openCreate = (): void => {
    router.push('/create-recipe');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenContainer scrollable={false} padded={false}>
        <View style={styles.header}>
          <ThemedText variant="title">{t().myRecipes.title}</ThemedText>
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
            ] as const
          ).map(([key, label, count]) => {
            const isActive = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key as Tab)}
                style={[
                  styles.segment,
                  { backgroundColor: isActive ? colors.primary : 'transparent' },
                ]}
              >
                <ThemedText
                  variant="caption"
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
                        ? 'rgba(255,255,255,0.25)'
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

        {items.length === 0 ? (
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
            data={items as Recipe[]}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) => (
              <RecipeCard
                name={item.name}
                image={item.image}
                cuisine={item.cuisine}
                difficulty={item.difficulty}
                rating={item.rating}
                tags={item.tags}
                onPress={() => openRecipe(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
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
    padding: 4,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: radii.round,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  countPill: {
    minWidth: 20,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontWeight: '700',
    fontSize: 11,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.md,
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
