import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { InlineTimer } from '@presentation/base/widgets/inline-timer';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';

export interface InstructionCardProps {
  index: number;
  step: string;
  completed: boolean;
  onToggle: () => void;
}

const TIME_RE = /(\d+(?:\.\d+)?)\s*(minutes?|mins?|dakika|dk)/gi;

interface TextPart {
  kind: 'text' | 'timer';
  value: string;
  minutes?: number;
}

export const splitStepWithTimers = (text: string): TextPart[] => {
  const out: TextPart[] = [];
  let last = 0;
  TIME_RE.lastIndex = 0;
  let match: RegExpExecArray | null = TIME_RE.exec(text);
  while (match !== null) {
    if (match.index > last) {
      out.push({ kind: 'text', value: text.slice(last, match.index) });
    }
    const minutes = parseFloat(match[1]);
    out.push({ kind: 'timer', value: match[0], minutes });
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

export const InstructionCard = ({
  index,
  step,
  completed,
  onToggle,
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
                  <InlineTimer minutes={part.minutes} />
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontWeight: '700',
    fontSize: 13,
  },
  body: {
    flex: 1,
  },
  stepText: {
    lineHeight: 22,
  },
});
