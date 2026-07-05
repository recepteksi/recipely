/** What the avatar-upload hook hands back to the profile screen. */
export interface AvatarUpload {
  pickAndUpload: () => Promise<void>;
  isUploading: boolean;
}
