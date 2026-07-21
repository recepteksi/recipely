import { fail } from '@core/result/result-helpers';
import type { Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Email } from '@domain/common/email';
import { UserEntity } from '@domain/auth/user-entity';
import type { RecipelyUserDto } from '@infrastructure/auth/recipely-user-dto';

/**
 * Maps a `RecipelyUserDto` from the API into a domain `UserEntity` entity. Validates
 * the raw email string through `Email.create` before constructing the entity,
 * returning a `ValidationFailure` if the address is malformed.
 */
export const toUser = (dto: RecipelyUserDto): Result<UserEntity, ValidationFailure> => {
  const emailResult = Email.create(dto.email);
  if (!emailResult.ok) {
    return fail(emailResult.failure);
  }
  return UserEntity.create({
    id: dto.id,
    email: emailResult.value,
    displayName: dto.displayName,
    ...(dto.photoUrl ? { photoUrl: dto.photoUrl } : {}),
    ...(dto.bio ? { bio: dto.bio } : {}),
  });
};
