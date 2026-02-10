import { UserRole } from '@/common/enums/user-role.enum';

export class CurrentUserResponseDto {
  id: string;
  email: string;
  role: UserRole;
}
