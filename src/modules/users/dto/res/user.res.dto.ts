import { UserBasicResponseDto } from '@/common/dto/res/user-basic.dto';
import { UserRole } from '@/common/enums/user-role.enum';

export class UserResponseDto extends UserBasicResponseDto {
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
