import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { InlineTimer } from '@presentation/base/widgets/inline-timer';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import type { TextPart } from '@presentation/base/widgets/text-part';

export interface InstructionCardProps {
  index: number;
  step: string;
  completed: boolean;
  onToggle: () => void;
  recipeId: string;
  recipeName: string;
}

const DURATION_UNIT = 'minutes?|mins?|dakika|dk';
// Alternation, tried in order at every match position: a "45-50 minutes"
// range is matched whole by the first branch (captured in group 1) before the
// second branch gets a chance to latch onto just the trailing number — that
// ordering is what previously produced the "45-" + badge("50 min") split.
const TIME_RE = new RegExp(
  `(\\d+(?:\\.\\d+)?\\s*-\\s*\\d+(?:\\.\\d+)?\\s*(?:${DURATION_UNIT}))|(\\d+(?:\\.\\d+)?)\\s*(?:${DURATION_UNIT})`,
  'gi',
);

export const splitStepWithTimers = (text: string): TextPart[] => {
  const out: TextPart[] = [];
  let last = 0;
  TIME_RE.lastIndex = 0;
  let match: RegExpExecArray | null = TIME_RE.exec(text);
  while (match !== null) {
    if (match.index > last) {
      out.push({ kind: 'text', value: text.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      // A range ("45-50 minutes") isn't a single actionable duration — keep
      // it as plain text rather than badge-ify a partial, misleading match.
      out.push({ kind: 'text', value: match[0] });
    } else {
      const minutes = parseFloat(match[2]);
      out.push({ kind: 'timer', value: match[0], minutes });
    }
    last = match.index + match[0].length;
    match = TIME_RE.exec(text);
  }
  if (last < text.length) {
    out.push({ kind: 'text', value: text.slice(last) });
  }
  if (out.length === 0) {
    out.push({ kind: 'text', value: text });
  }
  return out;
};

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
          {parts.map((part, i) => {
            if (part.kind === 'timer' && part.minutes !== undefined) {
              return (
                <Fragment key={i}>
                  <InlineTimer
                    timerId={`${recipeId}:step${String(index)}:${String(Math.round(part.minutes))}min`}
                    recipeId={recipeId}
                    recipeName={recipeName}
                    minutes={part.minutes}
                  />
                </Fragment>
              );
            }
            return <Fragment key={i}>{part.value}</Fragment>;
          })}
        </ThemedText>
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
});
