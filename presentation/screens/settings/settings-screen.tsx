import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ScreenContainer } from '@presentation/base/widgets/screen-container';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { AvatarImage } from '@presentation/base/widgets/avatar-image';
import { SectionHeader } from '@presentation/base/widgets/section-header';
import { SettingsRow } from '@presentation/base/widgets/settings-row';
import { ThemeToggle } from '@presentation/base/widgets/theme-toggle';
import { ThemeGrid } from '@presentation/base/widgets/theme-grid';
import { LanguageSelector } from '@presentation/base/widgets/language-selector';
import { TabBar, type TabBarKey } from '@presentation/base/widgets/tab-bar';
import { useTheme } from '@presentation/base/theme/theme-context';
import { spacing, radii } from '@presentation/base/theme';
import { t, getLocale, setLocale } from '@presentation/i18n';

export const SettingsScreen = (): React.JSX.Element => {
  const router = useRouter();
  const { themeId, preference, setThemeId, setPreference, colors } = useTheme();
  const { authStore } = useStores();
  const authState = authStore((s) => s.state);
  const signOut = authStore((s) => s.signOut);

  const [language, setLanguage] = useState<'en' | 'tr'>(getLocale() as 'en' | 'tr');

  const handleLanguageChange = (lang: 'en' | 'tr') => {
    setLocale(lang);
    setLanguage(lang);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const onTabChange = (key: TabBarKey): void => {
    if (key === 'recipes') router.replace('/recipes');
    else if (key === 'myRecipes') router.replace('/my-recipes');
  };

  const displayName =
    authState.status === 'authenticated' ? authState.session.user.displayName : '';
  const email =
    authState.status === 'authenticated' ? authState.session.user.email.value : '';
  const photoUrl =
    authState.status === 'authenticated' ? authState.session.user.photoUrl : undefined;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenContainer scrollable padded={false}>
        <View style={styles.profileSection}>
          <AvatarImage uri={photoUrl} name={displayName} size={80} />
          <ThemedText variant="title" style={styles.displayName}>
            {displayName}
          </ThemedText>
          <ThemedText variant="body" muted>
            {email}
          </ThemedText>
        </View>

        <SectionHeader title={t().settings.appearance} />
        <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.stackedRow}>
            <View style={styles.stackedHeader}>
              <Ionicons name="contrast-outline" size={20} color={colors.primary} />
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
            rightElement={
              <LanguageSelector value={language} onChange={handleLanguageChange} />
            }
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

        <SectionHeader title={t().settings.about} />
        <View style={[styles.group, { backgroundColor: colors.cardBackground }]}>
          <SettingsRow
            icon="information-circle-outline"
            label={t().settings.version}
            rightElement={
              <ThemedText variant="body" muted>
                1.0.0
              </ThemedText>
            }
            showChevron={false}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScreenContainer>
      <TabBar active="settings" onChange={onTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
    marginLeft: 54,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
