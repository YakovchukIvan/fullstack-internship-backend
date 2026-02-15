import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { UserBasicResponseDto } from '@/common/dto/res/user-basic.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';

export class CompanyMemberResponseDto {
  id: string;
  role: CompanyRole;
  user: UserBasicResponseDto;
  createdAt: string;
  updatedAt: string;
}

export class CompanyMembersListResponseDto extends PaginatedBaseResponseDto {
  members: CompanyMemberResponseDto[];
}
