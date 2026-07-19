import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { ValueConstants } from '@core/constants';

export interface StepRowProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  removeLabel: string;
}

/** Inline-editable, auto-growing instruction step with a numbered badge. */
export const StepRow = ({
  index,
  value,
  onChange,
  onRemove,
  removeLabel,
}: StepRowProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: focused ? colors.chipBackground : colors.surface,
          borderColor: focused ? colors.primary : colors.cardBorder,
        },
      ]}
    >
      <LinearGradient
        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
        start={{ x: ValueConstants.zero, y: ValueConstants.zero }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <ThemedText style={[styles.badgeLabel, { color: colors.primaryText }]}>
          {index + 1}
        </ThemedText>
      </LinearGradient>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t().createRecipe.stepPlaceholder}
        placeholderTextColor={colors.textMuted}
        multiline
        style={[styles.input, { color: colors.text }]}
      />
      <Pressable
        onPress={onRemove}
        hitSlop={8}
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
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.sm2,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  badge: {
    width: sizes.badgeSm,
    height: sizes.badgeSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontSize: fontSizes.medium,
    lineHeight: 21,
    minHeight: sizes.iconBtn,
    paddingVertical: spacing.xs,
    textAlignVertical: 'top',
  },
  removeBtn: {
    width: sizes.iconBtnSm,
    height: sizes.iconBtnSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
