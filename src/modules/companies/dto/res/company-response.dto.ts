import { CompanyRole } from '@/common/enums/company-role.enum';

class MemberUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export class CompanyResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  isVisible: boolean;
  ownerId: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

export class CompanyMemberResponseDto {
  id: string;
  role: CompanyRole;
  user: MemberUserDto;
  createdAt: string;
}
