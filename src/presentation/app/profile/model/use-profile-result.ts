import type { ProfileStatsState } from '@presentation/app/profile/model/profile-stats-state';

/** View model returned by {@link useProfile} for the profile screen. */
export interface UseProfileResult {
  displayName: string;
  handle: string;
  bio: string;
  photoUri: string | undefined;
  isUploading: boolean;
  onPickAvatar: () => void;
  onEditProfile: () => void;
  stats: ProfileStatsState;
  /** Localized message for the avatar upload-failure dialog; null when there is none. */
  uploadError: string | null;
  onDismissUploadError: () => void;
}
