import { CompanyRole } from '@/common/enums/company-role.enum';
import { SetMetadata } from '@nestjs/common';

export const COMPANY_ROLES_KEY = 'company_roles';
export const RequireCompanyRoles = (...roles: CompanyRole[]) => SetMetadata(COMPANY_ROLES_KEY, roles);
