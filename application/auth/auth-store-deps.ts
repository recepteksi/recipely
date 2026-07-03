import type { SignInUseCase } from '@application/auth/sign-in-use-case';
import type { RequestRegistrationUseCase } from '@application/auth/request-registration-use-case';
import type { VerifyRegistrationUseCase } from '@application/auth/verify-registration-use-case';
import type { ResendRegistrationCodeUseCase } from '@application/auth/resend-registration-code-use-case';
import type { SignOutUseCase } from '@application/auth/sign-out-use-case';
import type { GetSessionUseCase } from '@application/auth/get-session-use-case';
import type { SignInWithGoogleUseCase } from '@application/auth/sign-in-with-google-use-case';
import type { SignInWithAppleUseCase } from '@application/auth/sign-in-with-apple-use-case';
import type { RequestPasswordResetUseCase } from '@application/auth/request-password-reset-use-case';
import type { ResetPasswordUseCase } from '@application/auth/reset-password-use-case';
import type { UploadAvatarUseCase } from '@application/auth/upload-avatar-use-case';
import type { UpdateProfileUseCase } from '@application/auth/update-profile-use-case';
import type { LoadFavoritesUseCase } from '@application/favorites/load-favorites-use-case';
import type { SavedRecipesStore } from '@application/recipes/saved-recipes-store';

export interface AuthStoreDeps {
  signIn: SignInUseCase;
  requestRegistration: RequestRegistrationUseCase;
  verifyRegistration: VerifyRegistrationUseCase;
  resendRegistrationCode: ResendRegistrationCodeUseCase;
  signOut: SignOutUseCase;
  getSession: GetSessionUseCase;
  loadFavorites: LoadFavoritesUseCase;
  savedRecipesStore: SavedRecipesStore;
  signInWithGoogle: SignInWithGoogleUseCase;
  signInWithApple: SignInWithAppleUseCase;
  requestPasswordReset: RequestPasswordResetUseCase;
  resetPassword: ResetPasswordUseCase;
  uploadAvatar: UploadAvatarUseCase;
  updateProfile: UpdateProfileUseCase;
}
