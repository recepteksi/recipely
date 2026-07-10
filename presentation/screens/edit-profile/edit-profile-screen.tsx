import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/layout/keyboard-avoider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '@presentation/bootstrap/stores-context';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { AvatarImage } from '@presentation/base/widgets/media/avatar-image';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { useTheme } from '@presentation/base/theme/theme-context';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { showSuccessToast, showToast } from '@presentation/base/feedback/show-toast';
import { failureToastMessage } from '@presentation/base/errors/failure-lookups';
import { useAvatarUpload } from '@presentation/screens/profile/hooks/use-avatar-upload';
import { t } from '@presentation/i18n';

const AVATAR_FRAME = 110;
const AVATAR_INNER = 104;
const CAMERA_BTN = 32;
const BIO_MAX = 160;
const BIO_MIN_HEIGHT = 112;

export const EditProfileScreen = (): React.JSX.Element => {
  const router = useRouter();
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { pickAndUpload, isUploading } = useAvatarUpload();

  const { authStore } = useStores();
  const authState = authStore((s) => s.state);
  const updateProfile = authStore((s) => s.updateProfile);

  const user = authState.status === 'authenticated' ? authState.session.user : null;
  const initialDisplayName = user?.displayName ?? '';
  const initialBio = user?.bio ?? '';
  const photoUri = user?.photoUrl ?? undefined;

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = displayName.trim().length > 0;
  const dirty = displayName !== initialDisplayName || bio !== initialBio;
  const showNameError = dirty && !canSave;
  const bioAtLimit = bio.length >= BIO_MAX;

  const onSave = async (): Promise<void> => {
    if (!canSave || !dirty || isSaving) return;
    setIsSaving(true);
    try {
      const failure = await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      if (failure !== null) {
        showToast({ severity: 'danger', message: failureToastMessage(failure) });
        return;
      }
      showSuccessToast(t().editProfile.saved);
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  const saveEnabled = canSave && dirty && !isSaving;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t().errors.back}
        >
          <Ionicons name="chevron-back" size={sizes.iconMd} color={colors.text} />
        </Pressable>
        <ThemedText variant="subtitle" style={styles.headerTitle}>
          {t().editProfile.title}
        </ThemedText>
        <Pressable
          onPress={() => void onSave()}
          disabled={!saveEnabled}
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary },
            saveEnabled ? null : styles.saveBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t().editProfile.save}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primaryText} />
          ) : (
            <ThemedText style={[styles.saveBtnLabel, { color: colors.primaryText }]}>
              {t().editProfile.save}
            </ThemedText>
          )}
        </Pressable>
      </View>

      <KeyboardAvoider
        style={styles.flex}
        keyboardVerticalOffset={insets.top + spacing.xxl}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveContainer route="forms">
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                <View
                  style={[
                    styles.avatarFrame,
                    { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                    shadows.sm,
                  ]}
                >
                  <AvatarImage uri={photoUri} name={displayName} size={AVATAR_INNER} />
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
                    isUploading ? styles.disabled : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t().profile.changePhoto}
                >
                  <Ionicons name="camera" size={sizes.iconSm - 2} color={colors.primaryText} />
                </Pressable>
              </View>
              <Pressable
                onPress={() => void pickAndUpload()}
                disabled={isUploading}
                style={isUploading ? styles.disabled : null}
                accessibilityRole="button"
                accessibilityLabel={t().profile.changePhoto}
              >
                <ThemedText style={[styles.changePhoto, { color: colors.primary }]}>
                  {t().profile.changePhoto}
                </ThemedText>
              </Pressable>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.field}>
                <ThemedText variant="caption" muted style={styles.label}>
                  {t().editProfile.displayName.toUpperCase()}
                </ThemedText>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={t().editProfile.displayNamePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
                {showNameError ? (
                  <ThemedText variant="caption" style={[styles.errorLine, { color: colors.danger }]}>
                    {t().editProfile.displayNameRequired}
                  </ThemedText>
                ) : null}
              </View>

              <View style={styles.field}>
                <ThemedText variant="caption" muted style={styles.label}>
                  {t().editProfile.bio.toUpperCase()}
                </ThemedText>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder={t().editProfile.bioPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  multiline
                  numberOfLines={4}
                  maxLength={BIO_MAX}
                  textAlignVertical="top"
                />
                <ThemedText
                  variant="caption"
                  muted={!bioAtLimit}
                  style={[styles.counter, bioAtLimit ? { color: colors.danger } : null]}
                >
                  {bio.length}/{BIO_MAX}
                </ThemedText>
              </View>
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoider>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: sizes.iconBtn,
    height: sizes.iconBtn,
    borderRadius: sizes.iconBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontWeight: '700',
  },
  saveBtn: {
    minWidth: 72,
    height: sizes.iconBtn,
    paddingHorizontal: spacing.lg,
    borderRadius: sizes.iconBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnLabel: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
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
  disabled: {
    opacity: 0.6,
  },
  changePhoto: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
  card: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    height: 46,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
  },
  textArea: {
    height: BIO_MIN_HEIGHT,
    paddingTop: spacing.md,
  },
  errorLine: {
    fontWeight: '600',
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: fontSizes.small,
  },
});
