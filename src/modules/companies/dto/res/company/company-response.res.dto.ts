import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';

export class CompanyResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  isVisible: boolean;
  ownerId: string;
  membersCount: number;
  companyMemberRole: CompanyRole | null;
  createdAt: string;
  updatedAt: string;
}

export class CompaniesPaginatedBaseResponseDto extends PaginatedBaseResponseDto {
  companies: CompanyResponseDto[];
}
