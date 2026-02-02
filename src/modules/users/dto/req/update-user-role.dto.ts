import { UserRole } from '@/common/enums/user-role.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserRoleDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;
}
