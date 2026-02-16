import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dto/res/users/user.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: toIso(user.createdAt),
    updatedAt: toIso(user.updatedAt),
  };
}
