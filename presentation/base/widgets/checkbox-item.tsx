import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { ThemedText } from './themed-text';

export interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

export const CheckboxItem = ({
  label,
  checked,
  onToggle,
  disabled,
}: CheckboxItemProps): React.JSX.Element => {
  const colors = useTheme().colors;

  const boxStyle = checked
    ? { backgroundColor: colors.success, borderColor: colors.success }
    : { backgroundColor: 'transparent', borderColor: colors.border };

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={styles.row}
    >
      <View style={[styles.checkbox, boxStyle]}>
        {checked ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
      </View>
      <ThemedText
        variant="body"
        muted={checked}
        style={checked ? styles.checkedLabel : undefined}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: sizes.checkboxSize,
    height: sizes.checkboxSize,
    borderRadius: radii.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkedLabel: {
    textDecorationLine: 'line-through',
  },
});
