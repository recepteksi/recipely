import { fail, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Email } from '@domain/common/email';
import { User } from '@domain/auth/user';
import type { RecipelyUserDto } from '@infrastructure/auth/user-info-dto';

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
