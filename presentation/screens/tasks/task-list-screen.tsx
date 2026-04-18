import { useCallback, useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { StateView, type StateViewStatus } from '@presentation/base/widgets/state-view';
import { t } from '@presentation/i18n';
import { spacing, radii } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';

export const TaskListScreen = (): React.JSX.Element => {
  const router = useRouter();
  const params = useLocalSearchParams<{ recipeId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';

  const { taskListStore } = useStores();
  const taskListState = taskListStore((s) => s.byRecipeId[recipeId]);
  const load = taskListStore((s) => s.load);

  useEffect(() => {
    if (recipeId.length > 0 && (taskListState === undefined || taskListState.status === 'idle')) {
      void load(recipeId);
    }
  }, [recipeId, taskListState, load]);

  const onRefresh = useCallback(() => {
    if (recipeId.length > 0) {
      void load(recipeId);
    }
  }, [recipeId, load]);

  const current = taskListState ?? { status: 'loading' as const };
  const status: StateViewStatus =
    current.status === 'loading' || current.status === 'idle'
      ? 'loading'
      : current.status === 'error'
        ? 'error'
        : current.tasks.length === 0
          ? 'empty'
          : 'content';
  const failure: Failure | undefined = current.status === 'error' ? current.failure : undefined;
  const refreshing = current.status === 'loading';

  return (
    <ScreenContainer padded={false}>
      <StateView
        status={status}
        failure={failure}
        onRetry={onRefresh}
        emptyMessage={t().tasks.empty}
      >
        {current.status === 'loaded' ? (
          <FlatList
            data={current.tasks}
            keyExtractor={(a) => a.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/recipes/${recipeId}/tasks/${item.id}`)}
                style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
              >
                <ThemedText variant="subtitle">{item.title}</ThemedText>
                <View style={styles.meta}>
                  <View
                    style={[
                      styles.chip,
                      item.completed ? styles.completedChip : styles.pendingChip,
                    ]}
                  >
                    <ThemedText variant="caption">
                      {item.completed ? t().tasks.completed : t().tasks.pending}
                    </ThemedText>
                  </View>
                </View>
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
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.round,
  },
  completedChip: {
    backgroundColor: '#4caf5033',
  },
  pendingChip: {
    backgroundColor: '#ff980033',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8884',
    marginHorizontal: spacing.lg,
  },
});
