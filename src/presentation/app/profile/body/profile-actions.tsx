import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

const EDIT_BTN_HEIGHT = 42;

export interface ProfileActionsProps {
  onEditProfile: () => void;
}

/** Primary "Edit profile" action row below the stats. */
export const ProfileActions = ({
  onEditProfile,
}: ProfileActionsProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View style={styles.actionRow}>
      <Pressable
        onPress={onEditProfile}
        style={({ pressed }) => [
          styles.editBtn,
          { backgroundColor: colors.primary },
          pressed ? styles.pressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t().profile.editProfile}
        hitSlop={spacing.xs}
      >
        <Ionicons name="create-outline" size={sizes.iconSm} color={colors.primaryText} />
        <ThemedText style={[styles.editBtnLabel, { color: colors.primaryText }]}>
          {t().profile.editProfile}
        </ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: EDIT_BTN_HEIGHT,
    borderRadius: radii.lg,
  },
  editBtnLabel: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  pressed: {
    opacity: 0.85,
  },
});
