import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyBasicResponseDto } from '@/modules/companies/dto/res/company/company-basic.dto.res';
import { CompanyInvitationItemResponseDto } from '@/modules/companies/dto/res/requests/company-invitation.res.dto';

export class UserInvitationItemResponseDto {
  invitations: CompanyInvitationItemResponseDto;
  company: CompanyBasicResponseDto;
}

export class UserInvitationsListResponseDto extends PaginatedBaseResponseDto {
  invitations: UserInvitationItemResponseDto[];
}
