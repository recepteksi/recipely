import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { TimerChip } from '@presentation/base/widgets/timer-chip';
import { timerStore } from '@application/timers/timer-store';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';

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
});
