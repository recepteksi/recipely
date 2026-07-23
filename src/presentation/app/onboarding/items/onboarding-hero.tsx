import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { radii } from '@presentation/base/theme';
import { OpacityConstants } from '@presentation/base/constants';
import { HeroRecipes } from '@presentation/app/onboarding/items/hero-recipes';
import { HeroAI } from '@presentation/app/onboarding/items/hero-ai';
import { HeroTimer } from '@presentation/app/onboarding/items/hero-timer';
import type { OnboardingSlideKind } from '@presentation/app/onboarding/model/onboarding-slide-kind';

const BLOB_LARGE = 300;
const BLOB_SMALL = 260;
const HERO_WEB_SCALE = 1.18;

export interface OnboardingHeroProps {
  kind: OnboardingSlideKind;
  /** Enlarge the floating content for the roomier web hero panel. */
  web?: boolean;
  /** Whether the slide is in view — drives the staggered entrance replay. */
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HeroContent = ({ kind, active }: { kind: OnboardingSlideKind; active: boolean }): React.JSX.Element => {
  if (kind === 'recipes') return <HeroRecipes active={active} />;
  if (kind === 'ai') return <HeroAI active={active} />;
  return <HeroTimer active={active} />;
};

/**
 * The gradient hero panel behind a welcome slide: the brand gradient, two soft
 * ambient blobs, and the per-slide floating illustration centered on top.
 */
export const OnboardingHero = ({ kind, web = false, active = true, style }: OnboardingHeroProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.panel, shadows.lg, style]}
    >
      <View
        style={[
          styles.blob,
          styles.blobTop,
          { backgroundColor: colors.onOverlay, opacity: OpacityConstants.scrim },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.blobBottom,
          { backgroundColor: colors.onOverlay, opacity: OpacityConstants.scrimLight },
        ]}
      />
      <View style={web ? styles.contentWeb : styles.content}>
        <HeroContent kind={kind} active={active} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderRadius: radii.xxxl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: BLOB_LARGE,
  },
  blobTop: {
    top: -80,
    right: -60,
    width: BLOB_LARGE,
    height: BLOB_LARGE,
  },
  blobBottom: {
    bottom: -90,
    left: -50,
    width: BLOB_SMALL,
    height: BLOB_SMALL,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWeb: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: HERO_WEB_SCALE }],
  },
});
