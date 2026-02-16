import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { UserInvitationItemResponseDto } from '@/modules/companies/dto/res/requests/company-invitation.res.dto';

export class UserInvitationsListResponseDto extends PaginatedBaseResponseDto {
  invitations: UserInvitationItemResponseDto[];
}
