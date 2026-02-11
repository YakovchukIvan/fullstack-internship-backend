import { CompanyRole } from '@/common/enums/company-role.enum';

class MemberUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export class CompanyMemberResponseDto {
  id: string;
  role: CompanyRole;
  user: MemberUserDto;
  createdAt: string;
  updatedAt: string;
}
