import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyInvitationItemResponseDto } from '@/modules/companies/dto/res/requests/company-invitation.res.dto';

export class UserInvitationsListResponseDto extends PaginatedBaseResponseDto {
  invitations: CompanyInvitationItemResponseDto[];
}
