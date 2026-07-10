import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { alarmStore } from '@application/timers/alarm-store';
import { stopTimer } from '@presentation/base/timers/timer-controls';
import { startAlarmAudio, stopAlarmAudio } from '@infrastructure/audio/alarm-audio-service';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';

export interface AlarmScreenProps {
  timerId: string;
  recipeName: string;
}

const PULSE_DURATION = 600;
// Haptic fires every 1.5 s so the phone buzzes repeatedly while the alarm
// overlay is visible — useful when the device is on silent mode.
const HAPTIC_INTERVAL_MS = 1500;

export const AlarmScreen = ({ timerId, recipeName }: AlarmScreenProps): React.JSX.Element => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;
  const hapticActive = useRef(true);

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    // Looping alarm tone — bypasses silent switch on iOS.
    void startAlarmAudio();

    // Repeating haptic so the phone buzzes even when on silent mode.
    hapticActive.current = true;
    const buzz = async (): Promise<void> => {
      while (hapticActive.current) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await new Promise<void>((r) => setTimeout(r, HAPTIC_INTERVAL_MS));
      }
    };
    void buzz();

    return () => {
      pulse.stop();
      hapticActive.current = false;
      void stopAlarmAudio();
    };
  }, [scale]);

  const dismiss = useCallback(() => {
    hapticActive.current = false;
    void stopAlarmAudio();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    void stopTimer(timerId);
    alarmStore.getState().dismiss();
  }, [timerId]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + spacing.xxxl },
      ]}
    >
      <Animated.Text style={[styles.bell, { transform: [{ scale }] }]}>⏰</Animated.Text>

      <View style={styles.labels}>
        <ThemedText style={styles.title}>{t().alarm.title}</ThemedText>
        <ThemedText style={[styles.recipe, { color: colors.primary }]}>{recipeName}</ThemedText>
      </View>

      <View style={[styles.dismissRow, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t().alarm.dismiss}
          onPress={dismiss}
          style={[styles.dismissBtn, { backgroundColor: colors.primary }]}
        >
          <ThemedText style={[styles.dismissLabel, { color: colors.primaryText }]}>
            {t().alarm.dismiss}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bell: {
    fontSize: sizes.heroSquare,
    textAlign: 'center',
  },
  labels: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    fontSize: fontSizes.headline,
    fontWeight: '700',
    textAlign: 'center',
  },
  recipe: {
    fontSize: fontSizes.subtitle,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissRow: {
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  dismissBtn: {
    height: sizes.buttonHeight,
    borderRadius: radii.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissLabel: {
    fontSize: fontSizes.heading,
    fontWeight: '700',
  },
});
