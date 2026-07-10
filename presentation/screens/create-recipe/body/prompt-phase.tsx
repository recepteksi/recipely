import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import type { RecipeDraft } from '@domain/drafts/recipe-draft';

export interface PromptPhaseProps {
  insets: EdgeInsets;
  prompt: string;
  onChangePrompt: (value: string) => void;
  onAppendChip: (chip: string) => void;
  onGenerate: () => void;
  onStartBlank: () => void;
  onClose: () => void;
  latestDraft: RecipeDraft | null;
  onResumeDraft: () => void;
}

/** Phase 1 of the unified flow: the gradient hero + AI prompt entry. */
export const PromptPhase = ({
  insets,
  prompt,
  onChangePrompt,
  onAppendChip,
  onGenerate,
  onStartBlank,
  onClose,
  latestDraft,
  onResumeDraft,
}: PromptPhaseProps): React.JSX.Element => {
  const colors = useTheme().colors;
  const canGenerate = prompt.trim().length > 0;
  const ideaChips = t().createRecipe.ideaChips;
  const draftName = latestDraft?.snapshot.name?.trim();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t().createRecipe.cancel}
        >
          <Ionicons name="close" size={sizes.iconXxs} color={colors.text} />
        </Pressable>
        <ThemedText variant="subtitle" style={styles.headerTitle}>
          {t().createRecipe.promptTitle}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, shadows.md]}
        >
          <Ionicons name="sparkles" size={140} color={colors.onOverlay} style={styles.heroBgIcon} />
          <View style={[styles.heroBadge, { backgroundColor: colors.gradientSurface, borderColor: colors.gradientBorder }]}>
            <Ionicons name="restaurant" size={sizes.iconLg} color={colors.onOverlay} />
          </View>
          <ThemedText variant="title" style={[styles.heroTitle, { color: colors.onOverlay }]}>
            {t().createRecipe.promptHeadline}
          </ThemedText>
          <ThemedText variant="body" style={[styles.heroSub, { color: colors.onOverlay }]}>
            {t().createRecipe.promptSub}
          </ThemedText>
        </LinearGradient>

        {latestDraft !== null ? (
          <Pressable
            onPress={onResumeDraft}
            style={[styles.resumeCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            accessibilityRole="button"
            accessibilityLabel={t().createRecipe.resumeDraft}
          >
            <View style={[styles.resumeIcon, { backgroundColor: colors.chipBackground }]}>
              <Ionicons name="bookmark" size={sizes.iconSm} color={colors.primary} />
            </View>
            <View style={styles.resumeBody}>
              <ThemedText variant="caption" style={[styles.resumeKicker, { color: colors.primary }]}>
                {t().createRecipe.resumeDraft}
              </ThemedText>
              <ThemedText variant="body" style={[styles.resumeName, { color: colors.text }]} numberOfLines={1}>
                {draftName !== undefined && draftName.length > 0 ? draftName : t().drafts.untitled}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={sizes.iconXxs} color={colors.textMuted} />
          </Pressable>
        ) : null}

        <View style={[styles.promptCard, { backgroundColor: colors.surface, borderColor: colors.inputBorder }, shadows.sm]}>
          <TextInput
            value={prompt}
            onChangeText={onChangePrompt}
            placeholder={t().createRecipe.promptPlaceholder}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            style={[styles.promptInput, { color: colors.text }]}
          />
          <View style={styles.chipRow}>
            {ideaChips.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => onAppendChip(chip)}
                style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.background }]}
                accessibilityRole="button"
                accessibilityLabel={chip}
              >
                <ThemedText variant="caption" style={[styles.chipLabel, { color: colors.text }]}>
                  {chip}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={onGenerate}
          disabled={!canGenerate}
          style={[styles.cta, shadows.md, { opacity: canGenerate ? 1 : 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel={t().createRecipe.generate}
        >
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaInner}
          >
            <Ionicons name="sparkles" size={sizes.iconSm} color={colors.primaryText} />
            <ThemedText variant="body" style={[styles.ctaLabel, { color: colors.primaryText }]}>
              {t().createRecipe.generate}
            </ThemedText>
          </LinearGradient>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <ThemedText variant="caption" style={{ color: colors.textMuted }}>
            {t().createRecipe.or}
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          onPress={onStartBlank}
          style={[styles.blankBtn, { borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={t().createRecipe.startBlank}
        >
          <ThemedText variant="body" style={[styles.blankLabel, { color: colors.text }]}>
            {t().createRecipe.startBlank}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  iconBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerSpacer: {
    width: sizes.iconBtn,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    borderRadius: radii.xxl,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -spacing.lg,
    top: -spacing.lg,
    opacity: 0.18,
  },
  heroBadge: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontWeight: '800',
  },
  heroSub: {
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm2,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  resumeIcon: {
    width: sizes.floatingBtn,
    height: sizes.floatingBtn,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBody: {
    flex: 1,
  },
  resumeKicker: {
    fontWeight: '700',
    fontSize: fontSizes.micro,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  resumeName: {
    fontWeight: '600',
  },
  promptCard: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  promptInput: {
    minHeight: sizes.promptInputMin,
    fontSize: fontSizes.body,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs2,
    marginTop: spacing.sm,
  },
  chip: {
    height: sizes.chipHeight,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: fontSizes.small,
    fontWeight: '500',
  },
  cta: {
    height: sizes.buttonHeight,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  ctaInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaLabel: {
    fontWeight: '700',
    fontSize: fontSizes.heading,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  blankBtn: {
    height: sizes.buttonSmHeight,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankLabel: {
    fontWeight: '600',
    fontSize: fontSizes.medium,
  },
});
