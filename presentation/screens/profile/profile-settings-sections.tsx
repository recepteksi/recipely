import { useState } from 'react';
import { Platform, StyleSheet, View, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { SectionHeader } from '@presentation/base/widgets/section-header';
import { SettingsRow } from '@presentation/base/widgets/settings-row';
import { ThemeToggle } from '@presentation/base/widgets/theme-toggle';
import { ThemeGrid } from '@presentation/base/widgets/theme-grid';
import { LanguageSelector } from '@presentation/base/widgets/language-selector';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii, sizes } from '@presentation/base/theme';
import { t, useLocale, setLocale } from '@presentation/i18n';
import { FeedbackSheet } from '@presentation/screens/profile/feedback-sheet';
import { WebFeedbackModal } from '@presentation/screens/profile/web-feedback-modal';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@infrastructure/constants/api';

export const ProfileSettingsSections = (): React.JSX.Element => {
  const router = useRouter();
  const { themeId, preference, setThemeId, setPreference, colors } = useTheme();
  const { authStore } = useStores();
  const signOut = authStore((s) => s.signOut);

  const language = useLocale() as 'en' | 'tr';
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View>
      <SectionHeader title={t().settings.appearance} />
      <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.stackedRow}>
          <View style={styles.stackedHeader}>
            <Ionicons name="contrast-outline" size={sizes.iconMd} color={colors.primary} />
            <ThemedText variant="body" style={styles.stackedLabel}>
              {t().settings.mode}
            </ThemedText>
          </View>
          <ThemeToggle value={preference} onChange={setPreference} />
        </View>
        <View style={[styles.rowSeparator, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="language-outline"
          label={t().settings.language}
          rightElement={<LanguageSelector value={language} onChange={setLocale} />}
        />
      </View>

      <SectionHeader title={t().settings.themePalette} />
      <ThemeGrid selectedThemeId={themeId} onSelect={setThemeId} />

      <SectionHeader title={t().settings.account} />
      <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
        <SettingsRow
          icon="log-out-outline"
          label={t().settings.signOut}
          destructive
          onPress={() => void handleSignOut()}
        />
      </View>

      <SectionHeader title={t().support.section} />
      <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
        <SettingsRow
          icon="help-buoy-outline"
          label={t().support.sendFeedback}
          onPress={() => setFeedbackOpen(true)}
        />
      </View>

      <SectionHeader title={t().settings.about} />
      <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
        <SettingsRow
          icon="information-circle-outline"
          label={t().settings.version}
          rightElement={
            <ThemedText variant="body" muted>
              {APP_VERSION}
            </ThemedText>
          }
          showChevron={false}
        />
        <SettingsRow
          icon="shield-checkmark-outline"
          label={t().settings.privacyPolicy}
          onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
        />
        <SettingsRow
          icon="document-text-outline"
          label={t().settings.termsOfUse}
          onPress={() => void Linking.openURL(TERMS_OF_USE_URL)}
        />
      </View>

      {Platform.OS === 'web' ? (
        <WebFeedbackModal visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      ) : (
        <FeedbackSheet visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      )}
    </View>
  );
};

const APP_VERSION = '1.0.0';

const styles = StyleSheet.create({
  group: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
  },
  stackedRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  stackedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stackedLabel: {
    flex: 1,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: sizes.searchBarHeight + spacing.sm2,
  },
});
