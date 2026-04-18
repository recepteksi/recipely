import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { AvatarImage } from '@presentation/base/widgets/avatar-image';
import { SectionHeader } from '@presentation/base/widgets/section-header';
import { SettingsRow } from '@presentation/base/widgets/settings-row';
import { ThemeSelector } from '@presentation/base/widgets/theme-selector';
import { LanguageSelector } from '@presentation/base/widgets/language-selector';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { t, getLocale, setLocale } from '@presentation/i18n';
import { getThemeDefinition } from '@presentation/base/theme/themes';

export const SettingsScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { themeId, scheme, setThemeId, colors } = useTheme();
  const { authStore } = useStores();
  const authState = authStore((s) => s.state);
  const signOut = authStore((s) => s.signOut);

  const [language, setLanguage] = useState<'en' | 'tr'>(getLocale() as 'en' | 'tr');
  const [themeSelectorVisible, setThemeSelectorVisible] = useState(false);

  const currentTheme = getThemeDefinition(themeId);
  const currentThemeColors = scheme === 'dark' ? currentTheme.dark : currentTheme.light;

  const handleLanguageChange = (lang: 'en' | 'tr') => {
    setLocale(lang);
    setLanguage(lang);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const displayName =
    authState.status === 'authenticated' ? authState.session.user.displayName : '';
  const email =
    authState.status === 'authenticated' ? authState.session.user.email.value : '';
  const photoUrl =
    authState.status === 'authenticated' ? authState.session.user.photoUrl : undefined;

  return (
    <ScreenContainer scrollable padded={false}>
      <View style={styles.profileSection}>
        <AvatarImage uri={photoUrl} name={displayName} size={80} />
        <ThemedText variant="title" style={styles.displayName}>{displayName}</ThemedText>
        <ThemedText variant="body" muted>{email}</ThemedText>
      </View>

      <SectionHeader title={t().settings.appearance} />
      <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
        <SettingsRow
          icon="color-palette-outline"
          label={t().settings.theme}
          onPress={() => setThemeSelectorVisible(true)}
          rightElement={
            <View style={styles.themePreview}>
              <LinearGradient
                colors={[
                  currentThemeColors.primaryGradientStart,
                  currentThemeColors.primaryGradientEnd,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.themePreviewDot}
              />
              <ThemedText variant="body" muted style={styles.themePreviewName}>
                {currentTheme.name}
              </ThemedText>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          }
        />
        <View style={[styles.rowSeparator, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="language-outline"
          label={t().settings.language}
          rightElement={<LanguageSelector value={language} onChange={handleLanguageChange} />}
        />
      </View>

      <ThemeSelector
        visible={themeSelectorVisible}
        onClose={() => setThemeSelectorVisible(false)}
        onSelect={setThemeId}
      />

      <SectionHeader title={t().settings.account} />
      <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
        <SettingsRow
          icon="log-out-outline"
          label={t().settings.signOut}
          destructive
          onPress={() => void handleSignOut()}
        />
      </View>

      <SectionHeader title={t().settings.about} />
      <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
        <SettingsRow
          icon="information-circle-outline"
          label={t().settings.version}
          rightElement={<ThemedText variant="body" muted>1.0.0</ThemedText>}
          showChevron={false}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  displayName: {
    marginTop: spacing.md,
  },
  group: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themePreviewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themePreviewName: {
    fontSize: 14,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
