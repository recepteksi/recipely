import { useCallback, useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { StateView, type StateViewStatus } from '@presentation/base/widgets/state-view';
import { t } from '@presentation/i18n';
import { spacing } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';

export const RecipeListScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { recipeListStore } = useStores();
  const state = recipeListStore((s) => s.state);
  const load = recipeListStore((s) => s.load);

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

  const status: StateViewStatus =
    state.status === 'idle' || state.status === 'loading'
      ? 'loading'
      : state.status === 'error'
        ? 'error'
        : state.recipes.length === 0
          ? 'empty'
          : 'content';
  const failure: Failure | undefined = state.status === 'error' ? state.failure : undefined;
  const refreshing = state.status === 'loading';

  return (
    <ScreenContainer padded={false}>
      <StateView
        status={status}
        failure={failure}
        onRetry={onRefresh}
        emptyMessage={t().recipes.empty}
      >
        {state.status === 'loaded' ? (
          <FlatList
            data={state.recipes}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => openRecipe(item.id)}
                style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
              >
                <ThemedText variant="subtitle">{item.name}</ThemedText>
                <ThemedText variant="caption" muted>
                  {item.cuisine} · {item.difficulty} · {item.rating.toFixed(1)} ★
                </ThemedText>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : null}
      </StateView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.sm,
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  rowPressed: {
    opacity: 0.6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8884',
    marginHorizontal: spacing.lg,
  },
});
