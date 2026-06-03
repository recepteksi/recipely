import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';

export interface StepperProps {
  value: number;
  suffix?: string;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
}

/** Compact pill stepper used inside a spec row. */
export const Stepper = ({
  value,
  suffix,
  decreaseLabel,
  increaseLabel,
  onDecrement,
  onIncrement,
}: StepperProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View
      style={[
        styles.root,
        { borderColor: colors.border, backgroundColor: colors.background },
      ]}
    >
      <Pressable
        onPress={onDecrement}
        hitSlop={6}
        style={styles.zone}
        accessibilityRole="button"
        accessibilityLabel={decreaseLabel}
      >
        <ThemedText style={[styles.sign, { color: colors.primary }]}>−</ThemedText>
      </Pressable>
      <View style={styles.valueWrap}>
        <ThemedText style={[styles.value, { color: colors.text }]}>{value}</ThemedText>
        {suffix !== undefined ? (
          <ThemedText style={[styles.suffix, { color: colors.textMuted }]}>{suffix}</ThemedText>
        ) : null}
      </View>
      <Pressable
        onPress={onIncrement}
        hitSlop={6}
        style={styles.zone}
        accessibilityRole="button"
        accessibilityLabel={increaseLabel}
      >
        <ThemedText style={[styles.sign, { color: colors.primary }]}>+</ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sizes.iconBtn,
    borderRadius: radii.round,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  zone: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sign: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
    lineHeight: fontSizes.title,
  },
  valueWrap: {
    minWidth: sizes.floatingBtn,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  value: {
    fontSize: fontSizes.heading,
    fontWeight: '800',
  },
  suffix: {
    fontSize: fontSizes.micro,
    fontWeight: '600',
  },
});
