import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { useRecipeTimer } from '@presentation/base/hooks/use-recipe-timer';
import { formatTimer } from '@presentation/base/utils/format-timer';
import { timerStore } from '@application/timers/timer-store';
import type { TimerEntry } from '@application/timers/timer-entry';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { t } from '@presentation/i18n';

interface TimerChipProps {
  entry: TimerEntry;
}

const TimerChip = ({ entry }: TimerChipProps): React.JSX.Element => {
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

/** Floating bar showing every active timer across all screens. Tap a chip to open its recipe. */
export const ActiveTimersBar = (): React.JSX.Element | null => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const timers = timerStore((s) => s.timers);
  const entries = Object.values(timers);

  if (entries.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.bar, { bottom: insets.bottom + sizes.tabBarHeight + spacing.sm }]}
    >
      <View
        style={[
          styles.barInner,
          { backgroundColor: colors.surface, borderColor: colors.border },
          shadows.md as object,
        ]}
      >
        <View style={[styles.barHandle, { backgroundColor: colors.border }]} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          keyboardShouldPersistTaps="handled"
        >
          {entries.map((entry) => (
            <TimerChip key={entry.id} entry={entry} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
  },
  barInner: {
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  barHandle: {
    width: 32,
    height: 3,
    borderRadius: radii.round,
    alignSelf: 'center',
    marginBottom: spacing.xs,
    opacity: 0.4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
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
