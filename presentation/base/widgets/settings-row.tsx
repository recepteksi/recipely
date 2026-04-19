import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, sizes } from '@presentation/base/theme';
import { ThemedText } from './themed-text';

export interface SettingsRowProps {
  icon: string;
  label: string;
  rightElement?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

export const SettingsRow = ({
  icon,
  label,
  rightElement,
  onPress,
  destructive = false,
  showChevron,
}: SettingsRowProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const iconColor = destructive ? colors.danger : colors.primary;
  const chevronVisible = showChevron ?? (onPress !== undefined);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.cardBackground, opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={iconColor} />
      <ThemedText
        variant="body"
        style={[styles.label, destructive ? { color: colors.danger } : undefined]}
      >
        {label}
      </ThemedText>
      {rightElement}
      {chevronVisible && !rightElement ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    height: sizes.settingsRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
