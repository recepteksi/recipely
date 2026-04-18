import { fail, type Result } from '@core/result/result';
import { ValidationFailure } from '@core/failure';
import { Email } from '@domain/common/email';
import { User } from '@domain/auth/user';
import type { DummyJsonLoginDto } from '@infrastructure/auth/user-info-dto';

export const toUser = (dto: DummyJsonLoginDto): Result<User, ValidationFailure> => {
  const emailResult = Email.create(dto.email);
  if (!emailResult.ok) {
    return fail(emailResult.failure);
  }
  return User.create({
    id: String(dto.id),
    email: emailResult.value,
    displayName: `${dto.firstName} ${dto.lastName}`,
    photoUrl: dto.image,
  });
};
