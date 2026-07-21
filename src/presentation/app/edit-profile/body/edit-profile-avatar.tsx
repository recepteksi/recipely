import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { AvatarImage } from '@presentation/base/widgets/media/avatar-image';
import { useTheme } from '@presentation/base/theme/use-theme';
import { shadows } from '@presentation/base/theme/shadows';
import { spacing, fontSizes, sizes } from '@presentation/base/theme';
import { OpacityConstants } from '@presentation/base/constants';
import { t } from '@presentation/i18n';
import { ValueConstants } from '@core/constants';

const AVATAR_FRAME = sizes.editAvatarFrame;
const AVATAR_INNER = sizes.editAvatarInner;
const CAMERA_BTN = sizes.iconBtnSm;

export interface EditProfileAvatarProps {
  photoUri: string | undefined;
  displayName: string;
  isUploading: boolean;
  onPick: () => void;
}

/** Avatar with an upload overlay + camera button and a "Change photo" link. */
export const EditProfileAvatar = ({
  photoUri,
  displayName,
  isUploading,
  onPick,
}: EditProfileAvatarProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
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
          onPress={onPick}
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
          <Ionicons name="camera" size={sizes.iconSm - ValueConstants.two} color={colors.primaryText} />
        </Pressable>
      </View>
      <Pressable
        onPress={onPick}
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
  );
};

const styles = StyleSheet.create({
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
    borderRadius: AVATAR_FRAME / ValueConstants.two,
    padding: (AVATAR_FRAME - AVATAR_INNER) / ValueConstants.two,
    borderWidth: ValueConstants.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_FRAME / ValueConstants.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -spacing.xxs,
    right: -spacing.xxs,
    width: CAMERA_BTN,
    height: CAMERA_BTN,
    borderRadius: CAMERA_BTN / ValueConstants.two,
    borderWidth: sizes.borderThick,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: OpacityConstants.disabledStrong,
  },
  changePhoto: {
    fontWeight: '700',
    fontSize: fontSizes.body,
  },
});
