import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { parseIngredient } from '@presentation/app/recipes/[recipeId]/model/parse-ingredient';
import { ValueConstants } from '@core/constants';
import { OpacityConstants } from '@presentation/base/constants';

export interface IngredientCardProps {
  raw: string;
  checked: boolean;
  onToggle: () => void;
}

/** Tappable ingredient row with parsed quantity chip and strikethrough-on-check behaviour. */
export const IngredientCard = ({
  raw,
  checked,
  onToggle,
}: IngredientCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const { qty, name } = parseIngredient(raw);
  const display = name.length > ValueConstants.zero ? name : raw;

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          opacity: checked ? OpacityConstants.disabledStrong : OpacityConstants.full,
        },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          checked
            ? { backgroundColor: colors.success, borderColor: colors.success }
            : { backgroundColor: 'transparent', borderColor: colors.border },
        ]}
      >
        {checked ? (
          <Ionicons name="checkmark" size={sizes.iconXs} color={colors.onSuccess} />
        ) : null}
      </View>

      {qty.length > ValueConstants.zero ? (
        <View style={[styles.qtyChip, { backgroundColor: colors.chipBackground }]}>
          <ThemedText
            variant="caption"
            style={[styles.qtyText, { color: colors.chipText }]}
          >
            {qty}
          </ThemedText>
        </View>
      ) : null}

      <ThemedText
        variant="body"
        style={[
          styles.name,
          {
            color: checked ? colors.textMuted : colors.text,
            textDecorationLine: checked ? 'line-through' : 'none',
          },
        ]}
      >
        {display}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: ValueConstants.one,
  },
  checkbox: {
    width: sizes.checkboxSize,
    height: sizes.checkboxSize,
    borderRadius: radii.sm,
    borderWidth: ValueConstants.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  qtyText: {
    fontWeight: '700',
    fontSize: fontSizes.small,
  },
  name: {
    flex: ValueConstants.one,
  },
});
