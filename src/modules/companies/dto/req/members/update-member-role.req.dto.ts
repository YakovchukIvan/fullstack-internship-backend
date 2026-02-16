import { IsEnum } from 'class-validator';
import { CompanyRole } from '@/common/enums/company-role.enum';

export class UpdateMemberRoleDto {
  @IsEnum(CompanyRole, { message: 'Role must be a valid company role' })
  role: CompanyRole;
}
