import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { MediaPicker } from '@presentation/screens/create-recipe/items/media-picker';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { MediaItem } from '@domain/recipes/media-item';

export interface PhotosSheetProps {
  visible: boolean;
  media: readonly MediaItem[];
  onAdd: (items: MediaItem[]) => void;
  onRemove: (index: number) => void;
  onSetCover: (index: number) => void;
  onClose: () => void;
}

/** Bottom sheet wrapping the shared `MediaPicker` for cover-photo editing. */
export const PhotosSheet = ({
  visible,
  media,
  onAdd,
  onRemove,
  onSetCover,
  onClose,
}: PhotosSheetProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.header}>
          <ThemedText variant="title">
            {t().createRecipe.photosTitle}
          </ThemedText>
          <Pressable
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.donePhotos}
          >
            <ThemedText variant="caption" style={[styles.doneLabel, { color: colors.primaryText }]}>
              {t().createRecipe.donePhotos}
            </ThemedText>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <MediaPicker media={media} onAdd={onAdd} onRemove={onRemove} onSetCover={onSetCover} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxHeight: '78%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  doneBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.round,
  },
  doneLabel: {
    fontWeight: '700',
  },
  body: {
    paddingBottom: spacing.md,
  },
});
