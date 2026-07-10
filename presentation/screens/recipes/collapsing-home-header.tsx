import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipelyLogo } from '@presentation/base/widgets/brand/recipely-logo';
import { SearchBar } from '@presentation/base/widgets/search-bar';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface CollapsingHomeHeaderProps {
  /** Live vertical scroll offset of the recipe list, in px. */
  scrollY: SharedValue<number>;
  /** Direction-aware band offset, range [-sizes.homeHeaderMax, 0]. */
  headerTranslateY: SharedValue<number>;
  /** When true, the band renders statically shown with no scroll-driven motion. */
  reduceMotion: boolean;
  onNotificationsPress: () => void;
  unreadCount: number;
  searchValue: string;
  onSearchChange: (text: string) => void;
}

/**
 * Mobile-only collapsing header band: the "Recipely" eyebrow, the large screen
 * title, the notifications bell, and the search field. Absolutely positioned over
 * the list; it slides up out of view on scroll-down and back on scroll-up
 * (`headerTranslateY`), while the title shrinks and the eyebrow fades as the list
 * scrolls past `sizes.homeTitleShrink` (`scrollY`). With reduce-motion on it stays
 * fully shown at rest geometry.
 *
 * The band is absolutely positioned so it can float over the list and slide
 * independently of it — which also means it falls outside the parent
 * `SafeAreaView`'s flow and never receives its top padding (RN measures an
 * absolutely-positioned child's `top: 0` from the parent's own edge, ignoring
 * that parent's padding). It applies `useSafeAreaInsets().top` itself so the
 * eyebrow/title never render under the status bar / notch.
 */
export const CollapsingHomeHeader = ({
  scrollY,
  headerTranslateY,
  reduceMotion,
  onNotificationsPress,
  unreadCount,
  searchValue,
  onSearchChange,
}: CollapsingHomeHeaderProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: reduceMotion ? 0 : headerTranslateY.value }],
  }));

  const titleStyle = useAnimatedStyle(() => {
    const scale = reduceMotion
      ? 1
      : interpolate(scrollY.value, [0, sizes.homeTitleShrink], [1, 0.82], Extrapolation.CLAMP);
    return { transform: [{ scale }] };
  });

  const eyebrowStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 1
      : interpolate(
          scrollY.value,
          [0, sizes.homeTitleShrink * 0.5],
          [1, 0],
          Extrapolation.CLAMP,
        ),
  }));

  const searchStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion
      ? 1
      : interpolate(
          scrollY.value,
          [sizes.homeTitleShrink * 0.5, sizes.homeTitleShrink],
          [1, 0.55],
          Extrapolation.CLAMP,
        ),
  }));

  return (
    <Animated.View
      style={[styles.band, bandStyle, { top: insets.top, backgroundColor: colors.background }]}
    >
      <View style={styles.titleRow}>
        <View style={styles.titles}>
          <Animated.View style={eyebrowStyle}>
            <RecipelyLogo size={sizes.iconMd} />
          </Animated.View>
          <Animated.View style={[styles.titleScaleAnchor, titleStyle]}>
            <ThemedText variant="title" style={styles.screenTitle}>
              {t().recipes.title}
            </ThemedText>
          </Animated.View>
        </View>
        <Pressable
          onPress={onNotificationsPress}
          style={[styles.bell, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel={
            unreadCount > 0
              ? `${t().notifications.title}, ${unreadCount}`
              : t().notifications.title
          }
        >
          <Ionicons
            name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
            size={sizes.iconMd}
            color={colors.text}
          />
          {unreadCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.background }]}>
              <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Animated.View style={[styles.searchWrapper, searchStyle]}>
        <SearchBar
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder={t().recipes.searchPlaceholder}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  band: {
    // `top` is applied inline as `insets.top` (see the component body) rather
    // than a static 0 — absolutely-positioned children ignore their parent
    // SafeAreaView's top padding, so this must be set explicitly per-render.
    position: 'absolute',
    left: 0,
    right: 0,
    height: sizes.homeHeaderMax,
    zIndex: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  titles: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleScaleAnchor: {
    alignSelf: 'flex-start',
    transformOrigin: 'left',
  },
  screenTitle: {
    fontWeight: '700',
  },
  bell: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: sizes.iconBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  searchWrapper: {
    paddingBottom: spacing.sm,
  },
});
