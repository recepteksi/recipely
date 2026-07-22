import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { OnboardingHero } from '@presentation/app/onboarding/items/onboarding-hero';
import type { OnboardingSlide as OnboardingSlideModel } from '@presentation/app/onboarding/model/onboarding-slide';

export interface OnboardingSlideProps {
  slide: OnboardingSlideModel;
  /** Carousel page width so horizontal paging snaps cleanly. */
  width: number;
  /** Carousel page height — a definite height so the flex hero cannot collapse
   * inside the horizontal ScrollView. */
  height: number;
}

/** One full-width carousel page: the gradient hero above the slide's copy. */
export const OnboardingSlide = ({ slide, width, height }: OnboardingSlideProps): React.JSX.Element => {
  const colors = useTheme().colors;
  return (
    <View style={[styles.page, { width, height }]}>
      <OnboardingHero kind={slide.kind} style={styles.hero} />
      <View style={styles.copy}>
        <View style={[styles.eyebrow, { backgroundColor: colors.chipBackground }]}>
          <ThemedText style={[styles.eyebrowText, { color: colors.chipText }]}>
            {slide.eyebrow}
          </ThemedText>
        </View>
        <ThemedText style={styles.title}>{slide.title}</ThemedText>
        <ThemedText muted style={styles.body}>
          {slide.body}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.lg2,
  },
  hero: {
    flex: 1,
  },
  copy: {
    paddingTop: spacing.lg2,
    paddingBottom: spacing.xs2,
    gap: spacing.md,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
  },
  eyebrowText: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: fontSizes.headline,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 37,
  },
  body: {
    fontSize: fontSizes.heading,
    lineHeight: sizes.lineHeightMd + 4,
    maxWidth: sizes.maxContentMd,
  },
});
