import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { Slider } from '@presentation/base/widgets/slider';
import { spacing, radii, type ThemeColors } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface TimeSliderCardProps {
  label: string;
  value: number;
  icon: 'time-outline' | 'flame-outline';
  onChange: (next: number) => void;
  colors: ThemeColors;
}

const TIME_MIN = 0;
const TIME_MAX = 120;
const TIME_STEP = 5;

/** Card containing a labelled time value and a slider for prep/cook time entry. */
export const TimeSliderCard = ({
  label,
  value,
  icon,
  onChange,
  colors,
}: TimeSliderCardProps): React.JSX.Element => {
  return (
    <View
      style={[
        styles.timeCard,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.timeCardHeader}>
        <Ionicons name={icon} size={14} color={colors.primary} />
        <ThemedText
          variant="caption"
          style={[styles.timeCardLabel, { color: colors.textMuted }]}
        >
          {label}
        </ThemedText>
      </View>
      <View style={styles.timeCardValueRow}>
        <ThemedText style={[styles.timeCardValue, { color: colors.text }]}>
          {value}
        </ThemedText>
        <ThemedText
          variant="caption"
          style={[styles.timeCardUnit, { color: colors.textMuted }]}
        >
          {' '}
          {t().recipes.minutes}
        </ThemedText>
      </View>
      <Slider
        value={value}
        min={TIME_MIN}
        max={TIME_MAX}
        step={TIME_STEP}
        onChange={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  timeCard: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: 6,
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeCardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeCardValue: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  timeCardUnit: {
    fontSize: 12,
  },
});
