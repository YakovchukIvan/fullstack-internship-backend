import { CompanyInvitation } from '../../entities/company-invitation.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toMemberBasicResponseDto } from '../company-basic.mapper';
import { CompanyInvitationItemResponseDto } from '../../dto/res/company/company-invitation.res.dto';

export function toCompanyInvitationItemResponseDto(invitation: CompanyInvitation): CompanyInvitationItemResponseDto {
  return {
    id: invitation.id,
    user: toMemberBasicResponseDto(invitation.user),
    invitedBy: toMemberBasicResponseDto(invitation.inviter),
    message: invitation.message,
    status: invitation.status,
    createdAt: toIso(invitation.createdAt),
  };
}
