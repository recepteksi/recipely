import { useCallback } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';

export interface MediaPickerProps {
  media: readonly MediaItem[];
  onAdd: (items: MediaItem[]) => void;
  onRemove: (index: number) => void;
  onSetCover: (index: number) => void;
}

interface VideoTileProps {
  url: string;
}

const VideoTile = ({ url }: VideoTileProps): React.JSX.Element => {
  const player = useVideoPlayer(url, (p) => {
    p.muted = true;
    p.loop = false;
  });
  return <VideoView style={styles.tileMedia} player={player} contentFit="cover" />;
};

const pickAssets = async (
  mediaTypes: 'images' | 'videos' | 'all',
): Promise<MediaItem[]> => {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== 'granted') return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: mediaTypes !== 'videos',
    mediaTypes:
      mediaTypes === 'images'
        ? 'images'
        : mediaTypes === 'videos'
          ? 'videos'
          : ['images', 'videos'],
    quality: 0.85,
  });
  if (result.canceled) return [];
  return result.assets.map((a) => ({
    type: (a.type === 'video' ? 'video' : 'image') as MediaItem['type'],
    url: a.uri,
  }));
};

export const MediaPicker = ({
  media,
  onAdd,
  onRemove,
  onSetCover,
}: MediaPickerProps): React.JSX.Element => {
  const colors = useTheme().colors;

  const addPhotos = useCallback(async () => {
    const items = await pickAssets('images');
    if (items.length > 0) onAdd(items);
  }, [onAdd]);

  const addVideo = useCallback(async () => {
    const items = await pickAssets('videos');
    if (items.length > 0) onAdd(items);
  }, [onAdd]);

  if (media.length === 0) {
    return (
      <Pressable
        onPress={addPhotos}
        style={[
          styles.dropZone,
          { backgroundColor: colors.surface, borderColor: colors.inputBorder },
        ]}
      >
        <View style={[styles.dropIconWrap, { backgroundColor: colors.chipBackground }]}>
          <Ionicons name="camera-outline" size={24} color={colors.primary} />
        </View>
        <ThemedText variant="body" style={styles.dropTitle}>
          {t().mediaPicker.add}
        </ThemedText>
        <ThemedText variant="caption" muted style={styles.dropHint}>
          {t().mediaPicker.hint}
        </ThemedText>
        <View style={styles.dropActions}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              void addPhotos();
            }}
            style={[styles.miniBtn, { borderColor: colors.primary }]}
          >
            <Ionicons name="image-outline" size={14} color={colors.primary} />
            <ThemedText variant="caption" style={[styles.miniBtnLabel, { color: colors.primary }]}>
              {t().mediaPicker.photos}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              void addVideo();
            }}
            style={[styles.miniBtn, { borderColor: colors.primary }]}
          >
            <Ionicons name="videocam-outline" size={14} color={colors.primary} />
            <ThemedText variant="caption" style={[styles.miniBtnLabel, { color: colors.primary }]}>
              {t().mediaPicker.video}
            </ThemedText>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.grid}>
      {media.map((m, i) => (
        <View
          key={i}
          style={[
            styles.tile,
            {
              borderColor: i === 0 ? colors.primary : colors.cardBorder,
              borderWidth: i === 0 ? 2 : 1,
              backgroundColor: colors.skeleton,
            },
          ]}
        >
          {m.type === 'image' ? (
            <Image source={{ uri: m.url }} style={styles.tileMedia} resizeMode="cover" />
          ) : (
            <VideoTile url={m.url} />
          )}

          {m.type === 'video' ? (
            <View style={styles.videoOverlay} pointerEvents="none">
              <View style={styles.playPill}>
                <Ionicons name="play" size={12} color="#FFFFFF" />
              </View>
            </View>
          ) : null}

          {i === 0 ? (
            <View style={[styles.coverBadge, { backgroundColor: colors.primary }]}>
              <ThemedText
                variant="caption"
                style={[styles.coverText, { color: colors.primaryText }]}
              >
                {t().mediaPicker.cover}
              </ThemedText>
            </View>
          ) : null}

          <Pressable onPress={() => onRemove(i)} style={styles.removeBtn}>
            <Ionicons name="close" size={14} color="#FFFFFF" />
          </Pressable>

          {i !== 0 ? (
            <Pressable onPress={() => onSetCover(i)} style={styles.setCoverBtn}>
              <ThemedText variant="caption" style={styles.setCoverText}>
                {t().mediaPicker.setCover}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ))}
      <Pressable
        onPress={addPhotos}
        style={[
          styles.tile,
          styles.addTile,
          { borderColor: colors.inputBorder },
        ]}
      >
        <Ionicons name="add" size={24} color={colors.textMuted} />
        <ThemedText variant="caption" muted style={styles.addLabel}>
          {t().mediaPicker.more}
        </ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  dropZone: {
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  dropIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    fontWeight: '600',
  },
  dropHint: {
    textAlign: 'center',
  },
  dropActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  miniBtnLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tile: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    position: 'relative',
  },
  tileMedia: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  coverBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  coverText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCoverBtn: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  setCoverText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  addTile: {
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addLabel: {
    fontWeight: '600',
    fontSize: 11,
  },
});
