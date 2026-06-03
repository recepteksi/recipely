import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';

export interface SpecRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  children: React.ReactNode;
}

/** A full-width row inside the spec card: icon badge + label, control at right. */
export const SpecRow = ({ icon, label, last, children }: SpecRowProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View
      style={[
        styles.root,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: colors.chipBackground }]}>
        <Ionicons name={icon} size={sizes.iconSm} color={colors.primary} />
      </View>
      <ThemedText style={[styles.label, { color: colors.text }]}>{label}</ThemedText>
      <View style={styles.control}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm2,
  },
  iconBadge: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
  control: {
    marginLeft: 'auto',
  },
});
