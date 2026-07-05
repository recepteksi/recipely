import { useCallback, useState } from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStores } from '@presentation/bootstrap/stores-context';
import { showSuccessToast, showToast } from '@presentation/base/feedback/show-toast';
import { t } from '@presentation/i18n';
import type { AvatarUpload } from '@presentation/screens/profile/avatar-upload';
import type { PickSource } from '@presentation/screens/profile/pick-source';

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

/** Derives a multipart-friendly `fileName`/`mimeType` from a picked asset uri. */
const toUploadMeta = (uri: string): { fileName: string; mimeType: string } => {
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ext.length > 0 && ext.length <= 4 ? ext : 'jpg';
  return {
    fileName: `avatar-${Date.now()}.${safeExt}`,
    mimeType: MIME_BY_EXT[safeExt] ?? 'image/jpeg',
  };
};

/**
 * Drives the "change profile photo" flow: source choice (camera vs. library),
 * permission checks, the image picker, and the auth-store `uploadAvatar` call.
 * Surfaces every failure as a toast so the user never gets a silent dead end.
 * On web the camera option is skipped (unreliable there) and the library opens
 * directly. The avatar itself re-renders from the session the store updates.
 */
export const useAvatarUpload = (): AvatarUpload => {
  const { authStore } = useStores();
  const uploadAvatar = authStore((s) => s.uploadAvatar);
  const [isUploading, setIsUploading] = useState(false);

  const launch = useCallback(
    async (source: PickSource): Promise<void> => {
      const perm =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast({ severity: 'danger', message: t().profile.photoPermissionDenied });
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset === undefined) return;

      const { fileName, mimeType } = toUploadMeta(asset.uri);
      setIsUploading(true);
      try {
        const failure = await uploadAvatar(asset.uri, fileName, mimeType);
        if (failure !== null) {
          showToast({ severity: 'danger', message: t().profile.photoUploadFailed });
          return;
        }
        showSuccessToast(t().profile.photoUploadSuccess);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadAvatar],
  );

  const pickAndUpload = useCallback(async (): Promise<void> => {
    if (isUploading) return;

    if (Platform.OS === 'web') {
      await launch('library');
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t().profile.changePhoto,
          options: [
            t().profile.takePhoto,
            t().profile.chooseFromLibrary,
            t().common.cancel,
          ],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) void launch('camera');
          else if (index === 1) void launch('library');
        },
      );
      return;
    }

    Alert.alert(t().profile.changePhoto, undefined, [
      { text: t().profile.takePhoto, onPress: () => void launch('camera') },
      { text: t().profile.chooseFromLibrary, onPress: () => void launch('library') },
      { text: t().common.cancel, style: 'cancel' },
    ]);
  }, [isUploading, launch]);

  return { pickAndUpload, isUploading };
};
