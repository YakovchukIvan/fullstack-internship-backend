import { UserBasicResponseDto } from '@/common/dto/res/user-basic.dto';
import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { InvitationStatus } from '@/modules/companies/enums/invitation-status.enum';
import { CompanyBasicResponseDto } from './company-basic.dto.res';

export class CompanyJoinRequestItemResponseDto {
  id: string;
  user: UserBasicResponseDto;
  status: InvitationStatus;
  createdAt: string;
}

export class CompanyJoinRequestPaginationResponseDto extends PaginatedBaseResponseDto {
  joinRequest: CompanyJoinRequestItemResponseDto[];
  company: CompanyBasicResponseDto;
}
