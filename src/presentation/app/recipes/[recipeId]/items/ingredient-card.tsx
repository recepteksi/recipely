import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, sizes, fontSizes } from '@presentation/base/theme';
import { parseIngredient } from '@presentation/app/recipes/[recipeId]/model/parse-ingredient';

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
  const display = name.length > 0 ? name : raw;

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
          opacity: checked ? 0.6 : 1,
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
          <Ionicons name="checkmark" size={14} color={colors.onSuccess} />
        ) : null}
      </View>

      {qty.length > 0 ? (
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
    borderWidth: 1,
  },
  checkbox: {
    width: sizes.checkboxSize,
    height: sizes.checkboxSize,
    borderRadius: radii.sm,
    borderWidth: 2,
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
    flex: 1,
  },
});
