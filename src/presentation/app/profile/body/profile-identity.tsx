import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { AvatarImage } from '@presentation/base/widgets/media/avatar-image';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { ValueConstants } from '@core/constants';

const AVATAR_FRAME = 112;
const AVATAR_INNER = 106;
const CAMERA_BTN = 32;
const CAMERA_ICON = 14;

export interface ProfileIdentityProps {
  displayName: string;
  handle: string;
  bio: string;
  photoUri: string | undefined;
  isUploading: boolean;
  onPickAvatar: () => void;
  onAddBio: () => void;
}

/** Avatar (with upload overlay + camera button), display name, handle and bio. */
export const ProfileIdentity = ({
  displayName,
  handle,
  bio,
  photoUri,
  isUploading,
  onPickAvatar,
  onAddBio,
}: ProfileIdentityProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View style={styles.identityBlock}>
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
          onPress={onPickAvatar}
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
          <Ionicons name="camera" size={CAMERA_ICON} color={colors.primaryText} />
        </Pressable>
      </View>

      <ThemedText variant="title" style={styles.displayName}>
        {displayName}
      </ThemedText>
      {handle.length > ValueConstants.zero ? (
        <ThemedText variant="caption" muted style={styles.handle}>
          @{handle}
        </ThemedText>
      ) : null}
      {bio.length > ValueConstants.zero ? (
        <ThemedText variant="body" style={styles.bioText}>
          {bio}
        </ThemedText>
      ) : (
        <Pressable
          onPress={onAddBio}
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
  );
};

const styles = StyleSheet.create({
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
});
