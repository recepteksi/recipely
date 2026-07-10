import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { MediaSlide } from '@presentation/screens/recipes/detail/items/media-slide';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';

export interface MediaGalleryProps {
  media: readonly MediaItem[];
  height?: number;
}

/** Height-to-width ratio for the web hero so wide columns get a balanced photo. */
const WEB_HERO_ASPECT = 0.62;

/**
 * Horizontally paginated photo gallery with dot indicators and a centered counter.
 *
 * The slide width is measured from the gallery's own container (via onLayout) rather
 * than the window, so on web the photo fills the responsive column exactly instead of
 * being cropped by a window-wide slide. On web, where the FlatList cannot be swiped
 * with a mouse, prev/next arrows scroll to the adjacent slide.
 */
export const MediaGallery = ({
  media,
  height = sizes.heroImageHeight,
}: MediaGalleryProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(() => Dimensions.get('window').width);
  const listRef = useRef<FlatList<MediaItem>>(null);

  const resolvedHeight =
    Platform.OS === 'web'
      ? Math.min(Math.round(width * WEB_HERO_ASPECT), sizes.heroImageHeightWeb)
      : height;

  const onLayout = (e: LayoutChangeEvent): void => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next > 0 && next !== width) setWidth(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    if (idx !== active && idx >= 0 && idx < media.length) {
      setActive(idx);
    }
  };

  const goTo = (idx: number): void => {
    if (idx < 0 || idx >= media.length) return;
    listRef.current?.scrollToIndex({ index: idx, animated: true });
    setActive(idx);
  };

  // Keep the active slide pinned when the measured width changes (e.g. web resize),
  // otherwise the FlatList would drift to a fractional offset between two photos.
  useEffect(() => {
    listRef.current?.scrollToIndex({ index: active, animated: false });
  }, [width, active]);

  const showArrows = Platform.OS === 'web' && media.length > 1;

  return (
    <View style={{ height: resolvedHeight }} onLayout={onLayout}>
      <FlatList
        ref={listRef}
        data={media as MediaItem[]}
        extraData={width}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <MediaSlide item={item} width={width} height={resolvedHeight} />
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {showArrows && active > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t().recipes.previousPhoto}
          onPress={() => goTo(active - 1)}
          style={[styles.arrow, styles.arrowLeft, { backgroundColor: colors.overlay }]}
        >
          <Ionicons name="chevron-back" size={sizes.iconMd} color={colors.onOverlay} />
        </Pressable>
      ) : null}

      {showArrows && active < media.length - 1 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t().recipes.nextPhoto}
          onPress={() => goTo(active + 1)}
          style={[styles.arrow, styles.arrowRight, { backgroundColor: colors.overlay }]}
        >
          <Ionicons name="chevron-forward" size={sizes.iconMd} color={colors.onOverlay} />
        </Pressable>
      ) : null}

      {media.length > 1 ? (
        <>
          <View style={styles.dotsRow} pointerEvents="none">
            {media.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === active ? colors.onOverlay : colors.onOverlay + '66',
                    width: i === active ? sizes.dotActiveWidth : sizes.progressBarHeight,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.counterWrap} pointerEvents="none">
            <View style={[styles.counter, { backgroundColor: colors.overlay }]}>
              <ThemedText
                variant="caption"
                style={[styles.counterText, { color: colors.onOverlay }]}
              >
                {active + 1} / {media.length}
              </ThemedText>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    position: 'absolute',
    top: '50%',
    width: sizes.floatingBtn,
    height: sizes.floatingBtn,
    marginTop: -sizes.floatingBtn / 2,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: {
    left: spacing.md,
  },
  arrowRight: {
    right: spacing.md,
  },
  dotsRow: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: sizes.progressBarHeight,
    borderRadius: radii.round,
  },
  counterWrap: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counter: {
    paddingHorizontal: spacing.sm2,
    paddingVertical: spacing.xxs,
    borderRadius: radii.round,
  },
  counterText: {
    fontWeight: '600',
    fontSize: fontSizes.small,
  },
});
