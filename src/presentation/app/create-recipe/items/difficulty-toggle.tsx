import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { DIFFICULTY_VALUES, type Difficulty } from '@domain/recipes/difficulty';

export interface DifficultyToggleProps {
  value: Difficulty;
  label: (difficulty: Difficulty) => string;
  onChange: (difficulty: Difficulty) => void;
}

/** Segmented Easy / Medium / Hard control sized to its content. */
export const DifficultyToggle = ({
  value,
  label,
  onChange,
}: DifficultyToggleProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={[styles.root, { borderColor: colors.border, backgroundColor: colors.background }]}>
      {DIFFICULTY_VALUES.map((option, index) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityLabel={label(option)}
            style={[
              styles.segment,
              {
                borderLeftWidth: index > 0 ? 1 : 0,
                borderLeftColor: colors.border,
                backgroundColor: active ? colors.primary : 'transparent',
              },
            ]}
          >
            <ThemedText
              style={[
                styles.label,
                { color: active ? colors.primaryText : colors.textMuted },
              ]}
            >
              {label(option)}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    height: sizes.iconBtn,
    borderRadius: radii.round,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
});
