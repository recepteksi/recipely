import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { MediaSlide } from '@presentation/base/widgets/media-slide';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';
import type { MediaItem } from '@domain/recipes/media-item';

export interface MediaGalleryProps {
  media: readonly MediaItem[];
  height?: number;
}

/** Horizontally paginated gallery supporting both images and videos with dot indicators. */
export const MediaGallery = ({
  media,
  height = sizes.heroImageHeight,
}: MediaGalleryProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [active, setActive] = useState(0);
  const width = Dimensions.get('window').width;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    if (idx !== active && idx >= 0 && idx < media.length) {
      setActive(idx);
    }
  };

  return (
    <View style={{ height }}>
      <FlatList
        data={media as MediaItem[]}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <MediaSlide item={item} width={width} height={height} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

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
                    width: i === active ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
          <View style={[styles.counter, { backgroundColor: colors.overlay }]}>
            <ThemedText
              variant="caption"
              style={[styles.counterText, { color: colors.onOverlay }]}
            >
              {active + 1} / {media.length}
            </ThemedText>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsRow: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  counter: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.round,
  },
  counterText: {
    fontWeight: '600',
    fontSize: 12,
  },
});
