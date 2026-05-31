import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { MediaSlide } from '@presentation/base/widgets/media-slide';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';

export interface MediaGalleryProps {
  media: readonly MediaItem[];
  height?: number;
}

/**
 * Horizontally paginated photo gallery with dot indicators and a centered counter.
 * On web, where the FlatList cannot be swiped with a mouse, exposes prev/next arrows
 * that scroll to the adjacent slide.
 */
export const MediaGallery = ({
  media,
  height = sizes.heroImageHeight,
}: MediaGalleryProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [active, setActive] = useState(0);
  const width = Dimensions.get('window').width;
  const listRef = useRef<FlatList<MediaItem>>(null);

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

  const showArrows = Platform.OS === 'web' && media.length > 1;

  return (
    <View style={{ height }}>
      <FlatList
        ref={listRef}
        data={media as MediaItem[]}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <MediaSlide item={item} width={width} height={height} />
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
