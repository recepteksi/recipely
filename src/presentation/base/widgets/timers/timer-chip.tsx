import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { useRecipeTimer } from '@presentation/base/hooks/use-recipe-timer';
import { formatTimer } from '@presentation/base/utils/format-timer';
import type { TimerEntry } from '@application/timers/timer-entry';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

interface TimerChipProps {
  entry: TimerEntry;
}

export const TimerChip = ({ entry }: TimerChipProps): React.JSX.Element => {
  const { colors } = useTheme();
  const router = useRouter();
  const timer = useRecipeTimer({
    timerId: entry.id,
    recipeId: entry.recipeId,
    recipeName: entry.recipeName,
    minutes: entry.durationSeconds / 60,
  });

  const { remainingSeconds, isPaused, isDone } = timer;

  const handleTap = useCallback(() => {
    router.push(`/recipes/${entry.recipeId}`);
  }, [entry.recipeId, router]);

  const timeLabel = isDone
    ? `✓ ${t().timer.done}`
    : isPaused
      ? `⏸ ${formatTimer(remainingSeconds)}`
      : formatTimer(remainingSeconds);

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDone ? colors.successLight : colors.surface,
          borderColor: isDone ? colors.success : colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${entry.recipeName} — ${timeLabel}`}
        onPress={handleTap}
        style={styles.chipLeft}
      >
        <ThemedText
          style={[styles.chipName, { color: isDone ? colors.success : colors.text }]}
          numberOfLines={1}
        >
          {entry.recipeName}
        </ThemedText>
        <ThemedText
          style={[
            styles.chipTime,
            { color: isDone ? colors.success : colors.primary },
          ]}
        >
          {timeLabel}
        </ThemedText>
      </Pressable>
      <View style={styles.chipActions}>
        {!isDone ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Resume timer' : 'Pause timer'}
            onPress={() => void (isPaused ? timer.resume() : timer.pause())}
            style={[styles.actionBtn, { backgroundColor: colors.chipBackground }]}
          >
            <Ionicons name={isPaused ? 'play' : 'pause'} size={11} color={colors.primary} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop timer"
          onPress={() => void timer.stop()}
          style={[styles.actionBtn, { backgroundColor: colors.dangerLight }]}
        >
          <Ionicons name="close" size={12} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm2,
    paddingRight: spacing.xs,
    gap: spacing.xs,
    minWidth: 120,
    maxWidth: 180,
  },
  chipLeft: {
    flex: 1,
  },
  chipName: {
    fontSize: fontSizes.micro,
    fontWeight: '600' as const,
    lineHeight: 14,
  },
  chipTime: {
    fontSize: fontSizes.small,
    fontWeight: '700' as const,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  chipActions: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  actionBtn: {
    width: sizes.iconXxs,
    height: sizes.iconXxs,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
