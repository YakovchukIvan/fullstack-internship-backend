import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';

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

export class CompaniesPaginatedBaseResponseDto extends PaginatedBaseResponseDto {
  companies: CompanyResponseDto[];
}
