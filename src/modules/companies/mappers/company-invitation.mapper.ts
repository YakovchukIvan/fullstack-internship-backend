import { CompanyInvitation } from '../entities/company-invitation.entity';
import { CompanyInvitationResponseDto } from '../dto/res/company-invitation-response.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicDto, toCompanyBasicDto } from './shared.mapper';

export function toCompanyInvitationResponseDto(invitation: CompanyInvitation): CompanyInvitationResponseDto {
  return {
    id: invitation.id,
    user: toUserBasicDto(invitation.user),
    company: toCompanyBasicDto(invitation.company),
    invitedBy: toUserBasicDto(invitation.inviter),
    message: invitation.message,
    status: invitation.status,
    createdAt: toIso(invitation.createdAt),
    updatedAt: toIso(invitation.updatedAt),
  };
}
