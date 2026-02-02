import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../enums/user-role.enum';

export class UpdateUserRoleDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;
}
