import { UserBasicResponseDto } from '@/common/dto/res/user-basic.dto';
import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyBasicResponseDto } from '../company/company-basic.dto.res';
import { InvitationStatus } from '@/modules/companies/enums/invitation-status.enum';

export class CompanyInvitationItemResponseDto {
  id: string;
  user: UserBasicResponseDto;
  invitedBy: UserBasicResponseDto;
  message: string | null;
  status: InvitationStatus;
  createdAt: string;
}

export class CompanyInvitationsPaginationResponseDto extends PaginatedBaseResponseDto {
  invitations: CompanyInvitationItemResponseDto[];
  company: CompanyBasicResponseDto;
}
