import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { ValueConstants } from '@core/constants';

export interface ExitSheetProps {
  visible: boolean;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onKeepEditing: () => void;
}

/** Confirmation dialog shown when leaving an unpublished, unsaved recipe. */
export const ExitSheet = ({
  visible,
  onSaveDraft,
  onDiscard,
  onKeepEditing,
}: ExitSheetProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeepEditing}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onKeepEditing}>
        <Pressable style={[styles.card, { backgroundColor: colors.background }]} onPress={() => {}}>
          <View style={[styles.icon, { backgroundColor: colors.chipBackground }]}>
            <Ionicons name="bookmark" size={sizes.iconLg} color={colors.primary} />
          </View>
          <ThemedText variant="title">{t().createRecipe.exitTitle}</ThemedText>
          <ThemedText variant="body" style={[styles.body, { color: colors.textMuted }]}>
            {t().createRecipe.exitBody}
          </ThemedText>

          <Pressable
            onPress={onSaveDraft}
            style={[styles.primaryBtn, { overflow: 'hidden' }]}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.exitSave}
          >
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: ValueConstants.zero, y: ValueConstants.zero }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryInner}
            >
              <ThemedText variant="body" style={[styles.primaryLabel, { color: colors.primaryText }]}>
                {t().createRecipe.exitSave}
              </ThemedText>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={onDiscard}
            style={styles.textBtn}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.exitDiscard}
          >
            <ThemedText variant="body" style={[styles.discardLabel, { color: colors.danger }]}>
              {t().createRecipe.exitDiscard}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={onKeepEditing}
            style={styles.textBtn}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.keepEditing}
          >
            <ThemedText variant="caption" style={{ color: colors.textMuted, fontWeight: '600' }}>
              {t().createRecipe.keepEditing}
            </ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radii.xxl,
    padding: spacing.xl,
  },
  icon: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  body: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  primaryBtn: {
    height: sizes.buttonSmHeight,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  primaryInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  textBtn: {
    height: sizes.buttonSmHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardLabel: {
    fontWeight: '600',
  },
});
