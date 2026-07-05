import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';

interface InfoStatProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}

export const InfoStat = ({ icon, value, label }: InfoStatProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={styles.stat}>
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={sizes.iconXxs} color={colors.primary} />
      </View>
      <ThemedText style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText variant="label" muted style={styles.statLabel} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  badge: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: fontSizes.heading,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSizes.micro,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
