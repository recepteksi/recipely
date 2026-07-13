import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface EditProfileHeaderProps {
  topInset: number;
  saveEnabled: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
}

/** Sticky top bar for the edit-profile screen: back, title, and save button. */
export const EditProfileHeader = ({
  topInset,
  saveEnabled,
  isSaving,
  onBack,
  onSave,
}: EditProfileHeaderProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View
      style={[
        styles.header,
        { paddingTop: topInset + spacing.sm, backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={[styles.backBtn, { backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel={t().errors.back}
      >
        <Ionicons name="chevron-back" size={sizes.iconMd} color={colors.text} />
      </Pressable>
      <ThemedText variant="subtitle" style={styles.headerTitle}>
        {t().editProfile.title}
      </ThemedText>
      <Pressable
        onPress={onSave}
        disabled={!saveEnabled}
        style={[styles.saveBtn, { backgroundColor: colors.primary }, saveEnabled ? null : styles.saveBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel={t().editProfile.save}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.primaryText} />
        ) : (
          <ThemedText style={[styles.saveBtnLabel, { color: colors.primaryText }]}>
            {t().editProfile.save}
          </ThemedText>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: sizes.iconBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontWeight: '700',
  },
  saveBtn: {
    minWidth: 72,
    height: sizes.iconBtn,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.iconBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnLabel: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
});
