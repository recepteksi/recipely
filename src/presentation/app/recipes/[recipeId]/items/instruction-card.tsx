import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { InlineTimer } from '@presentation/app/recipes/[recipeId]/items/inline-timer';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { splitStepWithTimers } from '@presentation/app/recipes/[recipeId]/model/split-step-with-timers';

export interface InstructionCardProps {
  index: number;
  step: string;
  completed: boolean;
  onToggle: () => void;
  recipeId: string;
  recipeName: string;
}

/** Numbered instruction step card that detects time references and renders inline countdown timers. */
export const InstructionCard = ({
  index,
  step,
  completed,
  onToggle,
  recipeId,
  recipeName,
}: InstructionCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const parts = splitStepWithTimers(step);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
      ]}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        style={[
          styles.numberCircle,
          {
            backgroundColor: completed ? colors.success : colors.primary,
          },
        ]}
      >
        {completed ? (
          <Ionicons name="checkmark" size={14} color={colors.onSuccess} />
        ) : (
          <ThemedText
            variant="caption"
            style={[styles.numberText, { color: colors.primaryText }]}
          >
            {index + 1}
          </ThemedText>
        )}
      </Pressable>

      <View style={styles.body}>
        <ThemedText
          variant="body"
          style={[
            styles.stepText,
            {
              color: completed ? colors.textMuted : colors.text,
              textDecorationLine: completed ? 'line-through' : 'none',
            },
          ]}
        >
          {/* The full step renders as plain text — embedding the timer chip
              (a View) inside Text baseline-misaligns it on native, which is
              exactly the "crooked 10dk badge" bug. Chips live below instead. */}
          {parts.map((part, i) => (
            <Fragment key={i}>{part.value}</Fragment>
          ))}
        </ThemedText>
        {parts.some((part) => part.kind === 'timer') ? (
          <View style={styles.timerRow}>
            {parts.map((part, i) =>
              part.kind === 'timer' && part.minutes !== undefined ? (
                <InlineTimer
                  key={i}
                  timerId={`${recipeId}:step${String(index)}:${String(Math.round(part.minutes))}min`}
                  recipeId={recipeId}
                  recipeName={recipeName}
                  minutes={part.minutes}
                />
              ) : null,
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  numberCircle: {
    width: sizes.badgeSm,
    height: sizes.badgeSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontWeight: '700',
    fontSize: fontSizes.caption,
  },
  body: {
    flex: 1,
  },
  stepText: {
    lineHeight: 22,
  },
  timerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
