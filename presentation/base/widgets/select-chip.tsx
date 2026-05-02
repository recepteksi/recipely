import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii } from '@presentation/base/theme';

export interface SelectChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  flex?: boolean;
}

export const SelectChip = ({
  label,
  selected,
  onToggle,
  flex = false,
}: SelectChipProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.chip,
        flex ? styles.flex : null,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      {selected ? (
        <Ionicons name="checkmark" size={12} color={colors.primaryText} />
      ) : null}
      <ThemedText
        variant="caption"
        style={[
          styles.label,
          { color: selected ? colors.primaryText : colors.text },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.round,
    borderWidth: 1.5,
  },
  flex: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
  },
});
