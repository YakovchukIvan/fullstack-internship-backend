import { CompanyRole } from '@/common/enums/company-role.enum';

export class UserMembershipResponseDto {
  id: string;
  company: {
    name: string;
    slug: string;
  };
  role: CompanyRole;
  joinedAt: string;
}
