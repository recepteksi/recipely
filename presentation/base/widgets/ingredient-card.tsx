import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';

export interface IngredientCardProps {
  raw: string;
  checked: boolean;
  onToggle: () => void;
}

interface ParsedIngredient {
  qty: string;
  name: string;
}

const FRACTION_RE = /[¼½¾⅓⅔⅛⅜⅝⅞]/;
const QTY_HEAD_RE = /^\s*(\d+(?:[.,]\d+)?(?:\/\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*-\s*\d+(?:[.,]\d+)?)?(?:\s*(?:[a-zA-ZçğıöşüÇĞİÖŞÜ]{1,6}\.?))?/;

export const parseIngredient = (raw: string): ParsedIngredient => {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { qty: '', name: '' };

  const match = trimmed.match(QTY_HEAD_RE);
  if (!match) return { qty: '', name: trimmed };

  const qtyChunk = match[0].trim();
  const rest = trimmed.slice(match[0].length).trim();
  if (rest.length === 0) return { qty: '', name: trimmed };

  if (!/\d/.test(qtyChunk) && !FRACTION_RE.test(qtyChunk)) {
    return { qty: '', name: trimmed };
  }

  return { qty: qtyChunk, name: rest };
};

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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  qtyText: {
    fontWeight: '700',
    fontSize: 12,
  },
  name: {
    flex: 1,
  },
});
