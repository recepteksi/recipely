import { useCallback, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { ProgressBar } from '@presentation/base/widgets/progress-bar';
import { SkeletonLoader } from '@presentation/base/widgets/skeleton-loader';
import { t } from '@presentation/i18n';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';
import type { Task } from '@domain/tasks/task';

export const TaskListScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const params = useLocalSearchParams<{ recipeId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';

  const { taskListStore } = useStores();
  const taskListState = taskListStore((s) => s.byRecipeId[recipeId]);
  const load = taskListStore((s) => s.load);

  useEffect(() => {
    if (
      recipeId.length > 0 &&
      (taskListState === undefined || taskListState.status === 'idle')
    ) {
      void load(recipeId);
    }
  }, [recipeId, taskListState, load]);

  const onRefresh = useCallback(() => {
    if (recipeId.length > 0) {
      void load(recipeId);
    }
  }, [recipeId, load]);

  const current = taskListState ?? { status: 'loading' as const };
  const isLoading = current.status === 'loading' || current.status === 'idle';
  const isError = current.status === 'error';
  const isLoaded = current.status === 'loaded';
  const tasks = isLoaded ? current.tasks : [];
  const failure: Failure | undefined = isError ? current.failure : undefined;
  const refreshing = current.status === 'loading';

  if (isLoading) {
    return (
      <ScreenContainer padded={false}>
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLoader
              key={i}
              width="100%"
              height={60}
              borderRadius={12}
              style={i > 0 ? { marginTop: 8 } : undefined}
            />
          ))}
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer padded={false}>
        <View style={styles.centerContainer}>
          <ThemedText variant="body">
            {failure?.message ?? t().common.error}
          </ThemedText>
          <Pressable onPress={onRefresh} style={styles.retryButton}>
            <ThemedText variant="body" style={{ color: colors.primary }}>
              {t().common.retry}
            </ThemedText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoaded && tasks.length === 0) {
    return (
      <ScreenContainer padded={false}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={64}
            color={colors.textMuted}
          />
          <ThemedText variant="body" muted style={styles.emptyText}>
            {t().tasks.empty}
          </ThemedText>
        </View>
      </ScreenContainer>
    );
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const progressLabel =
    completedCount === tasks.length
      ? t().tasks.allCompleted
      : `${completedCount} ${t().common.of} ${tasks.length} ${t().tasks.progress}`;

  const renderItem = ({ item }: { item: Task }) => (
    <Pressable
      onPress={() => router.push(`/recipes/${recipeId}/tasks/${item.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          ...shadows.sm,
        },
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View
        style={[
          styles.checkbox,
          item.completed
            ? { backgroundColor: colors.success, borderColor: colors.success }
            : { backgroundColor: 'transparent', borderColor: colors.border },
        ]}
      >
        {item.completed ? (
          <Ionicons name="checkmark" size={16} color={colors.onSuccess} />
        ) : null}
      </View>

      <ThemedText
        variant="body"
        muted={item.completed}
        style={[
          styles.taskTitle,
          item.completed ? styles.completedTitle : null,
        ]}
      >
        {item.title}
      </ThemedText>

      <View
        style={[
          styles.badge,
          {
            backgroundColor: item.completed
              ? colors.successLight
              : colors.warningLight,
          },
        ]}
      >
        <ThemedText
          variant="caption"
          style={[
            styles.badgeText,
            {
              color: item.completed ? colors.success : colors.warning,
            },
          ]}
        >
          {item.completed ? t().tasks.completed : t().tasks.pending}
        </ThemedText>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer padded={false}>
      <FlatList
        data={tasks}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <ProgressBar
            current={completedCount}
            total={tasks.length}
            label={progressLabel}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.sm,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    flex: 1,
    marginLeft: 12,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  badge: {
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: '600',
  },
  separator: {
    height: 8,
  },
});
