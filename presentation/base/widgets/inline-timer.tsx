import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { useTheme } from '@presentation/base/theme/theme-context';
import { radii } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface InlineTimerProps {
  minutes: number;
}

const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const InlineTimer = ({
  minutes,
}: InlineTimerProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) setRunning(false);
  }, [remaining, running]);

  if (!active) {
    return (
      <Pressable
        onPress={() => {
          setActive(true);
          setRunning(true);
        }}
        style={[styles.idle, { backgroundColor: colors.chipBackground }]}
      >
        <Ionicons name="time-outline" size={12} color={colors.primary} />
        <ThemedText
          variant="caption"
          style={[styles.idleLabel, { color: colors.primary }]}
        >
          {minutes} {t().recipes.minutes}
        </ThemedText>
      </Pressable>
    );
  }

  const done = remaining === 0;
  return (
    <View
      style={[
        styles.active,
        {
          backgroundColor: done ? colors.successLight : colors.primary,
        },
      ]}
    >
      <ThemedText
        variant="caption"
        style={[
          styles.activeText,
          { color: done ? colors.success : colors.primaryText },
        ]}
      >
        {done ? '✓' : formatTime(remaining)}
      </ThemedText>
      <Pressable
        onPress={() => setRunning((r) => !r)}
        style={styles.activeBtn}
      >
        <Ionicons
          name={running ? 'pause' : 'play'}
          size={10}
          color={done ? colors.success : colors.primaryText}
        />
      </Pressable>
      <Pressable
        onPress={() => {
          setActive(false);
          setRunning(false);
          setRemaining(minutes * 60);
        }}
        style={styles.activeBtn}
      >
        <Ionicons
          name="close"
          size={12}
          color={done ? colors.success : colors.primaryText}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  idle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.round,
    alignSelf: 'flex-start',
  },
  idleLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
  active: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 2,
    borderRadius: radii.round,
    alignSelf: 'flex-start',
  },
  activeText: {
    fontWeight: '700',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  activeBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
