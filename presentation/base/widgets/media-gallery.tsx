import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';
import type { MediaItem } from '@domain/recipes/media-item';

export interface MediaGalleryProps {
  media: readonly MediaItem[];
  height?: number;
}

interface MediaSlideProps {
  item: MediaItem;
  width: number;
  height: number;
}

const VideoSlide = ({ item, width, height }: MediaSlideProps): React.JSX.Element => {
  const player = useVideoPlayer(item.url, (p) => {
    p.loop = false;
    p.muted = true;
  });
  return (
    <VideoView
      style={{ width, height }}
      player={player}
      contentFit="cover"
      nativeControls
    />
  );
};

const MediaSlide = ({ item, width, height }: MediaSlideProps): React.JSX.Element => {
  if (item.type === 'video') {
    return <VideoSlide item={item} width={width} height={height} />;
  }
  return (
    <Image
      source={{ uri: item.url }}
      style={{ width, height, resizeMode: 'cover' }}
    />
  );
};

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
        keyExtractor={(_, i) => String(i)}
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
                      i === active ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
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
