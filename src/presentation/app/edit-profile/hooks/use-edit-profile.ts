import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useStores } from '@presentation/bootstrap/use-stores';
import { showSuccessToast, showToast } from '@presentation/base/feedback/show-toast';
import { failureToastMessage } from '@presentation/base/errors/failure-lookups';
import { useAvatarUpload } from '@presentation/app/profile/hooks/use-avatar-upload';
import { t } from '@presentation/i18n';
import { BIO_MAX } from '@presentation/app/edit-profile/model/edit-profile-limits';
import type { UseEditProfileResult } from '@presentation/app/edit-profile/model/use-edit-profile-result';

/**
 * Orchestrates the edit-profile form: seeds the display name / bio from the
 * signed-in user, tracks dirty/validity state, uploads a new avatar, and saves
 * the profile (navigating back on success, toasting on failure).
 */
export const useEditProfile = (): UseEditProfileResult => {
  const router = useRouter();
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
  const saveEnabled = canSave && dirty && !isSaving;

  const onSave = async (): Promise<void> => {
    if (!canSave || !dirty || isSaving) return;
    setIsSaving(true);
    try {
      const failure = await updateProfile({ displayName: displayName.trim(), bio: bio.trim() });
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

  return {
    displayName,
    onChangeName: setDisplayName,
    bio,
    onChangeBio: setBio,
    photoUri,
    isUploading,
    onPickAvatar: () => void pickAndUpload(),
    showNameError,
    bioAtLimit,
    saveEnabled,
    isSaving,
    onSave: () => void onSave(),
    onBack: () => router.back(),
  };
};
