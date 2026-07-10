import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';

export interface WebHeaderSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  ariaClear: string;
}

const SEARCH_MAX_WIDTH = 460;

/** Pill-shaped search input centered in the header. Only mounted on Recipes. */
export const WebHeaderSearch = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
  ariaClear,
}: WebHeaderSearchProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Ionicons name="search" size={16} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={ariaLabel}
        style={[styles.input, { color: colors.text }]}
        autoCorrect={false}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel={ariaClear}
          style={styles.clearBtn}
        >
          <Ionicons name="close-circle" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: SEARCH_MAX_WIDTH,
    height: sizes.searchBarHeight - 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: fontSizes.medium,
    outlineStyle: 'none',
  } as object,
  clearBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
