import { useState } from 'react';
import { StyleSheet, View, Pressable, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolate,
  Extrapolation,
  FadeIn,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { shadows } from '@presentation/base/theme/shadows';
import { t } from '@presentation/i18n';

/** Scroll distance past the resting header over which the FAB collapses to a circle. */
const MORPH_DISTANCE = 64;

export interface FilterSortFabProps {
  /** Live vertical scroll offset of the recipe list, in px. */
  scrollY: SharedValue<number>;
  /** When true, the FAB stays permanently extended with no scroll-driven morph. */
  reduceMotion: boolean;
  /** Number of active filters; drives the badge (hidden when 0). */
  activeCount: number;
  onPress: () => void;
}

/**
 * Mobile-only Filter & Sort FAB. Extended (icon + label + count badge) near the
 * top of the feed; on scroll-down it morphs to a 56pt circular icon FAB (label
 * width → 0 and fades) and re-extends on scroll-up. It never hides, so filter
 * access is always one tap away. Tapping opens the filter bottom sheet.
 */
export const FilterSortFab = ({
  scrollY,
  reduceMotion,
  activeCount,
  onPress,
}: FilterSortFabProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  // Natural extended width, measured once so the morph interpolates to the real
  // localized label width rather than a guessed constant.
  const [extendedWidth, setExtendedWidth] = useState(0);

  const label = t().recipes.filtersAndSort;
  const accessibilityLabel = activeCount > 0 ? `${label}, ${activeCount}` : label;
  const badgeText = activeCount > 9 ? '9+' : String(activeCount);

  const onMeasure = (e: LayoutChangeEvent): void => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && extendedWidth === 0) setExtendedWidth(w);
  };

  const containerStyle = useAnimatedStyle(() => {
    if (reduceMotion || extendedWidth === 0) return {};
    const width = interpolate(
      scrollY.value,
      [sizes.homeHeaderMax, sizes.homeHeaderMax + MORPH_DISTANCE],
      [extendedWidth, sizes.fab],
      Extrapolation.CLAMP,
    );
    return { width };
  });

  const labelStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 1
      : interpolate(
          scrollY.value,
          [sizes.homeHeaderMax, sizes.homeHeaderMax + MORPH_DISTANCE],
          [1, 0],
          Extrapolation.CLAMP,
        ),
  }));

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(150)}
      style={[
        styles.container,
        containerStyle,
        {
          bottom: sizes.tabBarHeight + insets.bottom + spacing.lg,
          backgroundColor: colors.primary,
          borderColor: colors.gradientBorder,
          ...shadows.lg,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onLayout={onMeasure}
        style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name="funnel-outline" size={sizes.iconMd} color={colors.primaryText} />
        <Animated.View style={labelStyle}>
          <ThemedText
            variant="caption"
            numberOfLines={1}
            style={[styles.label, { color: colors.primaryText }]}
          >
            {label}
          </ThemedText>
        </Animated.View>
      </Pressable>

      {activeCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.background }]}>
          <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.lg,
    height: sizes.fabExtendedHeight,
    minWidth: sizes.fab,
    borderRadius: radii.round,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 30,
    overflow: 'visible',
  },
  pressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.round,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontWeight: '700',
    fontSize: fontSizes.caption,
  },
  badge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    minWidth: sizes.notifBadge,
    height: sizes.notifBadge,
    paddingHorizontal: spacing.xs,
    borderRadius: sizes.notifBadge / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.nano,
    fontWeight: '700',
  },
});
