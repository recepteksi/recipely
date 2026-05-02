import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface TimeCardProps {
  label: string;
  minutes: number;
  iconName: keyof typeof Ionicons.glyphMap;
}

const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const TimeCard = ({
  label,
  minutes,
  iconName,
}: TimeCardProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => setRemaining((r) => Math.max(0, r - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) setRunning(false);
  }, [remaining, running]);

  const done = remaining === 0;
  const active = running || remaining < minutes * 60;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: active ? colors.primary : colors.cardBorder,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: done ? colors.successLight : colors.chipBackground,
          },
        ]}
      >
        <Ionicons
          name={done ? 'checkmark' : iconName}
          size={18}
          color={done ? colors.success : colors.primary}
        />
      </View>
      <View style={styles.body}>
        <ThemedText variant="label" muted style={styles.label}>
          {label}
        </ThemedText>
        <ThemedText
          variant="subtitle"
          style={[
            styles.value,
            { fontVariant: active ? ['tabular-nums'] : undefined },
          ]}
        >
          {active ? formatTime(remaining) : `${minutes} ${t().recipes.minutes}`}
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => setRunning((r) => !r)}
          disabled={done}
          style={[
            styles.playButton,
            {
              backgroundColor: running ? colors.warning : colors.primary,
              opacity: done ? 0.4 : 1,
            },
          ]}
        >
          <Ionicons
            name={running ? 'pause' : 'play'}
            size={11}
            color="#FFFFFF"
          />
        </Pressable>
        {active ? (
          <Pressable
            onPress={() => {
              setRunning(false);
              setRemaining(minutes * 60);
            }}
            style={[styles.resetButton, { borderColor: colors.border }]}
          >
            <Ionicons name="refresh" size={14} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

