import type { Result } from '@core/result/result';
import type { Failure } from '@core/failure';
import type { AuthSession } from '@domain/auth/auth-session';
import type { IAuthRepository } from '@domain/auth/i-auth-repository';

/**
 * Uploads a new profile avatar for the signed-in user from a local file URI and
 * returns the updated, persisted `AuthSession` (with the new `photoUrl`).
 */
export class UploadAvatarUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  execute(
    fileUri: string,
    fileName: string,
    mimeType: string,
  ): Promise<Result<AuthSession, Failure>> {
    return this.repo.uploadAvatar(fileUri, fileName, mimeType);
  }
}
