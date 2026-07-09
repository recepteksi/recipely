import { useCallback } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';

export interface MediaPickerProps {
  media: readonly MediaItem[];
  onAdd: (items: MediaItem[]) => void;
  onRemove: (index: number) => void;
  onSetCover: (index: number) => void;
}

const pickImages = async (): Promise<MediaItem[]> => {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    mediaTypes: 'images',
    quality: 0.85,
  });
  if (result.canceled) return [];
  return result.assets.map((a) => ({ type: 'image', url: a.uri }));
};

const captureImage = async (): Promise<MediaItem[]> => {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return [];
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    quality: 0.85,
  });
  if (result.canceled) return [];
  return result.assets.map((a) => ({ type: 'image', url: a.uri }));
};

// expo-image-picker cannot open a native camera on web — hide the affordance.
const cameraAvailable = Platform.OS !== 'web';

export const MediaPicker = ({
  media,
  onAdd,
  onRemove,
  onSetCover,
}: MediaPickerProps): React.JSX.Element => {
  const colors = useTheme().colors;

  const addPhotos = useCallback(async () => {
    const items = await pickImages();
    if (items.length > 0) onAdd(items);
  }, [onAdd]);

  const takePhoto = useCallback(async () => {
    const items = await captureImage();
    if (items.length > 0) onAdd(items);
  }, [onAdd]);

  if (media.length === 0) {
    return (
      <View style={styles.emptyStack}>
        <Pressable
          onPress={addPhotos}
          accessibilityRole="button"
          accessibilityLabel={t().mediaPicker.add}
          style={[
            styles.dropZone,
            { backgroundColor: colors.surface, borderColor: colors.inputBorder },
          ]}
        >
          <View style={[styles.dropIconWrap, { backgroundColor: colors.chipBackground }]}>
            <Ionicons name="images-outline" size={24} color={colors.primary} />
          </View>
          <ThemedText variant="body" style={styles.dropTitle}>
            {t().mediaPicker.add}
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.dropHint}>
            {t().mediaPicker.hint}
          </ThemedText>
        </Pressable>
        {cameraAvailable ? (
          <Pressable
            onPress={takePhoto}
            accessibilityRole="button"
            accessibilityLabel={t().mediaPicker.takePhoto}
            style={[
              styles.cameraRow,
              { backgroundColor: colors.surface, borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="camera-outline" size={18} color={colors.primary} />
            <ThemedText variant="body" style={[styles.cameraLabel, { color: colors.primary }]}>
              {t().mediaPicker.takePhoto}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
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
          <Image source={{ uri: m.url }} style={styles.tileMedia} resizeMode="cover" />

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

          <Pressable
            onPress={() => onRemove(i)}
            accessibilityRole="button"
            accessibilityLabel={t().mediaPicker.remove}
            style={[styles.removeBtn, { backgroundColor: colors.overlay }]}
          >
            <Ionicons name="close" size={14} color={colors.onOverlay} />
          </Pressable>

          {i !== 0 ? (
            <Pressable
              onPress={() => onSetCover(i)}
              accessibilityRole="button"
              accessibilityLabel={t().mediaPicker.setCover}
              style={[styles.setCoverBtn, { backgroundColor: colors.overlay }]}
            >
              <ThemedText variant="caption" style={[styles.setCoverText, { color: colors.onOverlay }]}>
                {t().mediaPicker.setCover}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ))}
      <Pressable
        onPress={addPhotos}
        accessibilityRole="button"
        accessibilityLabel={t().mediaPicker.more}
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
      {cameraAvailable ? (
        <Pressable
          onPress={takePhoto}
          accessibilityRole="button"
          accessibilityLabel={t().mediaPicker.takePhoto}
          style={[
            styles.tile,
            styles.addTile,
            { borderColor: colors.inputBorder },
          ]}
        >
          <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
          <ThemedText variant="caption" muted style={styles.addLabel}>
            {t().mediaPicker.takePhoto}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStack: {
    gap: spacing.sm,
  },
  cameraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs2,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  cameraLabel: {
    fontWeight: '600',
  },
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
    width: sizes.buttonSmHeight,
    height: sizes.buttonSmHeight,
    borderRadius: radii.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    fontWeight: '600',
  },
  dropHint: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs2,
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
  coverBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs2,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  coverText: {
    fontSize: fontSizes.nano,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  removeBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCoverBtn: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs2,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
  },
  setCoverText: {
    fontSize: fontSizes.micro,
    fontWeight: '600',
  },
  addTile: {
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addLabel: {
    fontWeight: '600',
    fontSize: fontSizes.micro,
  },
});
