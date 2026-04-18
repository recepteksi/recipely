import { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { pickColors } from '@presentation/base/theme/colors';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { ThemedText } from './themed-text';

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar = ({ current, total, label }: ProgressBarProps): React.JSX.Element => {
  const colors = pickColors(useColorScheme());
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(total > 0 ? current / total : 0, { duration: 400 });
  }, [current, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {label ? <ThemedText variant="body" style={styles.label}>{label}</ThemedText> : null}
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.success }, fillStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  track: {
    height: sizes.progressBarHeight,
    borderRadius: radii.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.round,
  },
});
