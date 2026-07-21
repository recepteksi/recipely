import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { ValueConstants } from '@core/constants';

export interface IngredientRowProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  removeLabel: string;
}

/** Inline-editable ingredient row with a bullet, text field, and remove button. */
export const IngredientRow = ({
  value,
  onChange,
  onRemove,
  removeLabel,
}: IngredientRowProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: focused ? colors.chipBackground : 'transparent',
          borderColor: focused ? colors.primary : 'transparent',
        },
      ]}
    >
      <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t().createRecipe.ingredientPlaceholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text }]}
      />
      <Pressable
        onPress={onRemove}
        hitSlop={spacing.sm}
        style={styles.removeBtn}
        accessibilityRole="button"
        accessibilityLabel={removeLabel}
      >
        <Ionicons name="close" size={sizes.iconSm} color={colors.textMuted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm2,
    paddingVertical: spacing.xs2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: ValueConstants.one,
  },
  bullet: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radii.round,
  },
  input: {
    flex: ValueConstants.one,
    height: sizes.iconBtn,
    fontSize: fontSizes.body,
    paddingVertical: ValueConstants.zero,
  },
  removeBtn: {
    width: sizes.iconBtnSm,
    height: sizes.iconBtnSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
