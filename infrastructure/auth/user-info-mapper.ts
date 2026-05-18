import { fail, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Email } from '@domain/common/email';
import { User } from '@domain/auth/user';
import type { RecipelyUserDto } from '@infrastructure/auth/user-info-dto';

/**
 * Maps a `RecipelyUserDto` from the API into a domain `User` entity. Validates
 * the raw email string through `Email.create` before constructing the entity,
 * returning a `ValidationFailure` if the address is malformed.
 */
export const toUser = (dto: RecipelyUserDto): Result<User, ValidationFailure> => {
  const emailResult = Email.create(dto.email);
  if (!emailResult.ok) {
    return fail(emailResult.failure);
  }
  return User.create({
    id: dto.id,
    email: emailResult.value,
    displayName: dto.displayName,
    ...(dto.photoUrl ? { photoUrl: dto.photoUrl } : {}),
  });
};
