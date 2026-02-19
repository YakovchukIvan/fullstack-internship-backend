import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
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

export class UserMembershipListResponseDto extends PaginatedBaseResponseDto {
  membership: UserMembershipResponseDto[];
}
