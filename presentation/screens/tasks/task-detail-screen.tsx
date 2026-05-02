import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { StateView, type StateViewStatus } from '@presentation/base/widgets/state-view';
import { t } from '@presentation/i18n';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii } from '@presentation/base/theme';
import type { Failure } from '@presentation/base/types';

interface CheckCircleProps {
  completed: boolean;
}

const CheckCircle = ({ completed }: CheckCircleProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.circle,
        animatedStyle,
        completed
          ? { backgroundColor: colors.success }
          : {
              backgroundColor: 'transparent',
              borderWidth: 3,
              borderColor: colors.border,
            },
      ]}
    >
      {completed ? (
        <Ionicons name="checkmark" size={40} color={colors.onSuccess} />
      ) : null}
    </Animated.View>
  );
};

export const TaskDetailScreen = (): React.JSX.Element => {
  const colors = useTheme().colors;
  const params = useLocalSearchParams<{ recipeId: string; taskId: string }>();
  const recipeId = typeof params.recipeId === 'string' ? params.recipeId : '';
  const taskId = typeof params.taskId === 'string' ? params.taskId : '';
  const key = `${recipeId}:${taskId}`;

  const { taskDetailStore } = useStores();
  const taskState = taskDetailStore((s) => s.byKey[key]);
  const load = taskDetailStore((s) => s.load);

  useEffect(() => {
    if (
      recipeId.length > 0 &&
      taskId.length > 0 &&
      (taskState === undefined || taskState.status === 'idle')
    ) {
      void load(recipeId, taskId);
    }
  }, [recipeId, taskId, taskState, load]);

  const onRetry = useCallback(() => {
    if (recipeId.length > 0 && taskId.length > 0) {
      void load(recipeId, taskId);
    }
  }, [recipeId, taskId, load]);

  const current = taskState ?? { status: 'loading' as const };
  const status: StateViewStatus =
    current.status === 'loading' || current.status === 'idle'
      ? 'loading'
      : current.status === 'error'
        ? 'error'
        : 'content';
  const failure: Failure | undefined =
    current.status === 'error' ? current.failure : undefined;

  return (
    <ScreenContainer scrollable>
      <StateView status={status} failure={failure} onRetry={onRetry}>
        {current.status === 'loaded' ? (
          <View style={styles.container}>
            <ThemedText variant="title" style={styles.title}>
              {current.task.title}
            </ThemedText>

            <CheckCircle completed={current.task.completed} />

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: current.task.completed
                    ? colors.successLight
                    : colors.warningLight,
                },
              ]}
            >
              <ThemedText
                variant="subtitle"
                style={{
                  color: current.task.completed
                    ? colors.success
                    : colors.warning,
                }}
              >
                {current.task.completed
                  ? t().tasks.completed
                  : t().tasks.pending}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </StateView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  statusBadge: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.round,
  },
});
