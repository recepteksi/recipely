import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { RecipelyLogo } from '@presentation/base/widgets/brand/recipely-logo';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { GeneratingVariant } from '@presentation/app/create-recipe/model/generating-variant';
import { ValueConstants } from '@core/constants';

export interface GeneratingViewProps {
  /** 0..(steps-1) — drives the checklist fill and progress bar. */
  activeStep: number;
  /** Which flow's copy + step labels to show. Defaults to `generate`. */
  variant?: GeneratingVariant;
}

const STAGE = 188;
const CORE = 104;
const ORBIT_RADIUS = 90;
const ORBIT_COUNT = 6;
const GENERATE_STEP_KEYS = ['gen0', 'gen1', 'gen2', 'gen3', 'gen4'] as const;
const IMPORT_STEP_KEYS = ['import0', 'import1', 'import2', 'import3'] as const;
const LOGO_SIZE = 60;

/** The eye-catching "AI is cooking" showpiece shown while a recipe generates. */
export const GeneratingView = ({
  activeStep,
  variant = 'generate',
}: GeneratingViewProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const spin = useSharedValue(ValueConstants.zero);
  const breathe = useSharedValue(ValueConstants.zero);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 4500, easing: Easing.linear }), -1);
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(ValueConstants.zero, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [spin, breathe]);

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * -360}deg` }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.06 }],
  }));

  const copy = t().createRecipe;
  const isImport = variant === 'import';
  const steps = isImport
    ? IMPORT_STEP_KEYS.map((key) => copy[key])
    : GENERATE_STEP_KEYS.map((key) => copy[key]);
  const title = isImport ? copy.importTitle : copy.genTitle;
  const sub = isImport ? copy.importSub : copy.genSub;
  // Import runs long; clamp the spotlight to the final step so it keeps pulsing
  // instead of "completing" and sitting idle while the backend finishes.
  const lastStep = steps.length - 1;
  const spotlight = isImport ? Math.min(activeStep, lastStep) : activeStep;
  const progress = isImport
    ? Math.min(0.92, (spotlight + 1) / steps.length)
    : Math.min(1, (activeStep + 1) / steps.length);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.stage}>
        <Animated.View
          style={[
            styles.ring,
            { borderColor: colors.primary, borderTopColor: colors.primaryGradientEnd },
            ringStyle,
          ]}
        />
        <Animated.View style={[styles.orbit, orbitStyle]}>
          {Array.from({ length: ORBIT_COUNT }).map((_, n) => (
            <View
              key={n}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  opacity: 0.35 + (n % 3) * 0.22,
                  transform: [{ rotate: `${n * 60}deg` }, { translateX: ORBIT_RADIUS }],
                },
              ]}
            />
          ))}
        </Animated.View>
        <Animated.View style={coreStyle}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: ValueConstants.zero, y: ValueConstants.zero }}
            end={{ x: 1, y: 1 }}
            style={[styles.core, shadows.lg]}
          >
            <RecipelyLogo size={LOGO_SIZE} monochrome mono={colors.primaryText} />
            <View style={styles.twinkle}>
              <Ionicons name="sparkles" size={sizes.iconMd} color={colors.primaryText} />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.heading}>
        <ThemedText variant="title" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText variant="body" style={[styles.sub, { color: colors.textMuted }]}>
          {sub}
        </ThemedText>
      </View>

      <View style={styles.checklist}>
        {steps.map((label, i) => {
          const done = i < spotlight;
          const active = i === spotlight;
          return (
            <View key={label} style={[styles.checkRow, { opacity: done || active ? 1 : 0.4 }]}>
              <View
                style={[
                  styles.checkBadge,
                  {
                    backgroundColor: done ? colors.primary : 'transparent',
                    borderColor: active ? colors.primary : colors.border,
                    borderWidth: done ? ValueConstants.zero : 1.5,
                  },
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={sizes.iconSm} color={colors.primaryText} />
                ) : active ? (
                  <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                ) : null}
              </View>
              <ThemedText
                style={[
                  styles.checkLabel,
                  {
                    color: active || done ? colors.text : colors.textMuted,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {label}
              </ThemedText>
            </View>
          );
        })}
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: ValueConstants.zero, y: ValueConstants.zero }}
            end={{ x: 1, y: ValueConstants.zero }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  stage: {
    width: STAGE,
    height: STAGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: STAGE,
    height: STAGE,
    borderRadius: STAGE / 2,
    borderWidth: 3,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  orbit: {
    position: 'absolute',
    width: STAGE,
    height: STAGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radii.round,
  },
  core: {
    width: CORE,
    height: CORE,
    borderRadius: radii.xxl2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twinkle: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
  },
  heading: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    textAlign: 'center',
  },
  sub: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  checklist: {
    width: '100%',
    maxWidth: 320,
    gap: spacing.sm2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkBadge: {
    width: sizes.badgeSm,
    height: sizes.badgeSm,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radii.round,
  },
  checkLabel: {
    fontSize: fontSizes.medium,
  },
  progressTrack: {
    height: spacing.xs,
    borderRadius: radii.round,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: spacing.xs,
    borderRadius: radii.round,
  },
});
