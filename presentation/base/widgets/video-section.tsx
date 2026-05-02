import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import type { MediaItem } from '@domain/recipes/media-item';

export interface VideoSectionProps {
  videos: readonly MediaItem[];
}

export const VideoSection = ({
  videos,
}: VideoSectionProps): React.JSX.Element | null => {
  const colors = useTheme().colors;
  const [active, setActive] = useState(0);

  const sourceUrl = useMemo(() => videos[active]?.url ?? null, [videos, active]);

  const player = useVideoPlayer(sourceUrl, (p) => {
    p.loop = false;
    p.muted = false;
  });

  if (videos.length === 0) return null;

  return (
    <View>
      <View style={[styles.player, { backgroundColor: colors.skeleton }]}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls
        />
      </View>

      {videos.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbsRow}
        >
          {videos.map((v, i) => {
            const isActive = i === active;
            return (
              <Pressable
                key={i}
                onPress={() => setActive(i)}
                style={[
                  styles.thumb,
                  {
                    borderColor: isActive ? colors.primary : colors.cardBorder,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.thumbVideo, { backgroundColor: colors.skeleton }]} />
                <View style={[styles.thumbBadge, { backgroundColor: colors.overlay }]}>
                  <ThemedText
                    variant="caption"
                    style={[styles.thumbBadgeText, { color: colors.onOverlay }]}
                  >
                    {i + 1}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  player: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbsRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  thumb: {
    width: 80,
    height: 56,
    borderRadius: radii.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbVideo: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.round,
  },
  thumbBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
