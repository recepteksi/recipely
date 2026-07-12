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
import { useStores } from '@presentation/bootstrap/use-stores';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { AvatarImage } from '@presentation/base/widgets/media/avatar-image';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { failureToastMessage } from '@presentation/base/errors/failure-lookups';
import { useAvatarUpload } from '@presentation/app/profile/hooks/use-avatar-upload';
import { ProfileSettingsSections } from '@presentation/app/profile/body/profile-settings-sections';
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

  const { authStore, userProfileStore, savedRecipesStore } = useStores();
  const authState = authStore((s) => s.state);
  const profileState = userProfileStore((s) => s.state);
  const loadProfile = userProfileStore((s) => s.load);
  const savedCount = savedRecipesStore((s) => s.savedIds.size);

  const user = authState.status === 'authenticated' ? authState.session.user : null;
  const userId = user?.id;
  const displayName = user?.displayName ?? '';
  const email = user?.email.value ?? '';
  const photoUri = user?.photoUrl ?? undefined;
  const handle = email.split('@')[0];
  const bio = user?.bio?.trim() ?? '';

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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: isWebShell ? 0 : insets.top + spacing.sm,
          // Mobile: the root TabBar (hosted in _layout) sits below the page,
          // so only breathing room is needed; web keeps its former whitespace.
          paddingBottom: isWebShell ? sizes.tabBarHeight + spacing.xxl : spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
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
            {bio.length > 0 ? (
              <ThemedText variant="body" style={styles.bioText}>
                {bio}
              </ThemedText>
            ) : (
              <Pressable
                onPress={() => router.push('/edit-profile')}
                style={styles.bioPrompt}
                hitSlop={spacing.sm}
                accessibilityRole="button"
                accessibilityLabel={t().profile.addBioPrompt}
              >
                <ThemedText variant="caption" muted style={styles.bioPromptText}>
                  {t().profile.addBioPrompt}
                </ThemedText>
              </Pressable>
            )}
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
                { value: String(savedCount), label: t().profile.saved },
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
              onPress={() => router.push('/edit-profile')}
              style={({ pressed }) => [
                styles.editBtn,
                { backgroundColor: colors.primary },
                pressed ? styles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t().profile.editProfile}
              hitSlop={spacing.xs}
            >
              <Ionicons name="create-outline" size={sizes.iconSm} color={colors.primaryText} />
              <ThemedText style={[styles.editBtnLabel, { color: colors.primaryText }]}>
                {t().profile.editProfile}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.settingsSections}>
            <ProfileSettingsSections />
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
};

const AVATAR_FRAME = 112;
const AVATAR_INNER = 106;
const CAMERA_BTN = 32;

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  bioText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  bioPrompt: {
    marginTop: spacing.sm,
  },
  bioPromptText: {
    textAlign: 'center',
    fontStyle: 'italic',
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
  pressed: {
    opacity: 0.85,
  },
  settingsSections: {
    marginTop: spacing.lg,
  },
});

export default ProfileScreen;
