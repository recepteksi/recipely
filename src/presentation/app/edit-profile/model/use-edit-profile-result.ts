/** View model returned by {@link useEditProfile} for the edit-profile screen. */
export interface UseEditProfileResult {
  displayName: string;
  onChangeName: (value: string) => void;
  bio: string;
  onChangeBio: (value: string) => void;
  photoUri: string | undefined;
  isUploading: boolean;
  onPickAvatar: () => void;
  showNameError: boolean;
  bioAtLimit: boolean;
  saveEnabled: boolean;
  isSaving: boolean;
  onSave: () => void;
  onBack: () => void;
  /** Localized message for the save/avatar failure dialog; null when there is none. */
  errorDialog: string | null;
  onCloseErrorDialog: () => void;
}
