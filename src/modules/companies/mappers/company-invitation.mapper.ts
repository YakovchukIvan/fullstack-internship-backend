import { CompanyInvitation } from '../entities/company-invitation.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicResponseDto } from './company-basic.mapper';
import { CompanyInvitationItemResponseDto } from '../dto/res/requests/company-invitation.res.dto';

export function toCompanyInvitationItemResponseDto(invitation: CompanyInvitation): CompanyInvitationItemResponseDto {
  return {
    id: invitation.id,
    user: toUserBasicResponseDto(invitation.user),
    invitedBy: toUserBasicResponseDto(invitation.inviter),
    message: invitation.message,
    status: invitation.status,
    createdAt: toIso(invitation.createdAt),
    updatedAt: toIso(invitation.updatedAt),
  };
}
