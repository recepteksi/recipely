import { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@presentation/base/theme/theme-context';
import { pickColors } from '@presentation/base/theme/colors';

export interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader = ({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps): React.JSX.Element => {
  const colors = pickColors(useTheme().scheme);
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(withTiming(200, { duration: 1200 }), -1, false);
  }, [translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: colors.skeleton, overflow: 'hidden' },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.skeletonHighlight, width: 120, opacity: 0.6 },
          shimmerStyle,
        ]}
      />
    </Animated.View>
  );
};
