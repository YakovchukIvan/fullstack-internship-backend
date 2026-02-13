import { UserBasicDto } from '@/common/dto/res/user-basic.dto';
import { UserRole } from '@/common/enums/user-role.enum';

export class UserResponseDto extends UserBasicDto {
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
