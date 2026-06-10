import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/themed-text';
import { AvatarImage } from '@presentation/base/widgets/avatar-image';
import { ResponsiveContainer } from '@presentation/base/widgets/responsive-container';
import { useLayout } from '@presentation/base/responsive/layout-context';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { TabBar, type TabBarKey } from '@presentation/base/widgets/tab-bar';
import { failureToastMessage } from '@presentation/base/errors/failure-content';
import { useAvatarUpload } from '@presentation/screens/profile/use-avatar-upload';
import { t } from '@presentation/i18n';

const formatStat = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const ProfileScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { isWebShell } = useLayout();
  const { pickAndUpload, isUploading } = useAvatarUpload();

  const { authStore, userProfileStore } = useStores();
  const authState = authStore((s) => s.state);
  const profileState = userProfileStore((s) => s.state);
  const loadProfile = userProfileStore((s) => s.load);

  const user = authState.status === 'authenticated' ? authState.session.user : null;
  const userId = user?.id;
  const displayName = user?.displayName ?? '';
  const email = user?.email.value ?? '';
  const photoUri = user?.photoUrl ?? undefined;
  const handle = email.split('@')[0];

  useEffect(() => {
    if (userId !== undefined && profileState.status === 'idle') {
      void loadProfile(userId);
    }
  }, [userId, profileState.status, loadProfile]);

  const profile =
    profileState.status === 'loaded' ? profileState.profile : null;
  const isLoadingProfile = profileState.status === 'loading';
  const profileError =
    profileState.status === 'error' ? failureToastMessage(profileState.failure) : null;

  const onTabChange = (key: TabBarKey): void => {
    if (key === 'recipes') router.replace('/recipes');
    else if (key === 'myRecipes') router.replace('/my-recipes');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: isWebShell ? 0 : insets.top + spacing.sm,
          paddingBottom: insets.bottom + sizes.tabBarHeight + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isWebShell ? null : (
          <View style={styles.floatingActions}>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={[styles.floatingBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              accessibilityRole="button"
              accessibilityLabel={t().notifications.title}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/settings')}
              style={[styles.floatingBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              accessibilityRole="button"
              accessibilityLabel={t().settings.title}
            >
              <Ionicons name="settings-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        )}

        <ResponsiveContainer route="profile" gutter={false}>
          <View style={styles.identityBlock}>
            <View style={styles.avatarWrap}>
              <View
                style={[
                  styles.avatarFrame,
                  { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                  shadows.sm,
                ]}
              >
                <AvatarImage uri={photoUri} name={displayName} size={106} />
                {isUploading ? (
                  <View style={[styles.avatarOverlay, { backgroundColor: colors.overlay }]}>
                    <ActivityIndicator color={colors.onOverlay} />
                  </View>
                ) : null}
              </View>
              <Pressable
                onPress={() => void pickAndUpload()}
                disabled={isUploading}
                style={[
                  styles.cameraBtn,
                  { backgroundColor: colors.primary, borderColor: colors.background },
                  shadows.sm,
                  isUploading ? styles.cameraBtnDisabled : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t().profile.changePhoto}
              >
                <Ionicons name="camera" size={14} color={colors.primaryText} />
              </Pressable>
            </View>

            <ThemedText variant="title" style={styles.displayName}>
              {displayName}
            </ThemedText>
            {handle.length > 0 ? (
              <ThemedText variant="caption" muted style={styles.handle}>
                @{handle}
              </ThemedText>
            ) : null}
          </View>

          {isLoadingProfile ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : profileError !== null ? (
            <Pressable
              onPress={() => userId !== undefined && void loadProfile(userId)}
              style={[
                styles.statsError,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t().common.retry}
            >
              <ThemedText variant="caption" muted style={styles.statsErrorText}>
                {profileError}
              </ThemedText>
              <ThemedText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                {t().common.retry}
              </ThemedText>
            </Pressable>
          ) : profile !== null ? (
            <View
              style={[
                styles.statsRow,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
              ]}
            >
              {[
                { value: String(profile.recipeCount), label: t().profile.recipes },
                { value: formatStat(profile.totalLikes), label: t().profile.likes },
                { value: formatStat(profile.totalViews), label: t().profile.views },
              ].map((stat, idx, arr) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statCell,
                    idx < arr.length - 1
                      ? [styles.statDivider, { borderRightColor: colors.border }]
                      : null,
                  ]}
                >
                  <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                  <ThemedText variant="caption" muted style={styles.statLabel}>
                    {stat.label.toUpperCase()}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => router.push('/settings')}
              style={[styles.editBtn, { backgroundColor: colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel={t().profile.editProfile}
            >
              <Ionicons name="create-outline" size={16} color={colors.primaryText} />
              <ThemedText style={[styles.editBtnLabel, { color: colors.primaryText }]}>
                {t().profile.editProfile}
              </ThemedText>
            </Pressable>
            {isWebShell ? (
              <Pressable
                onPress={() => router.push('/settings')}
                style={[styles.iconAction, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                accessibilityRole="button"
                accessibilityLabel={t().settings.title}
              >
                <Ionicons name="settings-outline" size={18} color={colors.text} />
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.iconAction, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              accessibilityRole="button"
              accessibilityLabel={t().profile.shareProfile}
            >
              <Ionicons name="share-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        </ResponsiveContainer>
      </ScrollView>
      <TabBar active="profile" onChange={onTabChange} />
    </View>
  );
};

const AVATAR_FRAME = 112;
const AVATAR_INNER = 106;
const CAMERA_BTN = 32;

const styles = StyleSheet.create({
  root: { flex: 1 },
  floatingActions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
    zIndex: 2,
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  avatarWrap: {
    width: AVATAR_FRAME,
    height: AVATAR_FRAME,
    position: 'relative',
  },
  avatarFrame: {
    width: AVATAR_FRAME,
    height: AVATAR_FRAME,
    borderRadius: AVATAR_FRAME / 2,
    padding: (AVATAR_FRAME - AVATAR_INNER) / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_FRAME / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: CAMERA_BTN,
    height: CAMERA_BTN,
    borderRadius: CAMERA_BTN / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtnDisabled: {
    opacity: 0.6,
  },
  displayName: {
    fontWeight: '700',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  handle: {
    marginTop: 2,
    textAlign: 'center',
  },
  statsLoading: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  statsError: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.xs,
    alignItems: 'center',
  },
  statsErrorText: {
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    borderRightWidth: 1,
  },
  statValue: {
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 20,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 42,
    borderRadius: radii.lg,
  },
  editBtnLabel: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  iconAction: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
