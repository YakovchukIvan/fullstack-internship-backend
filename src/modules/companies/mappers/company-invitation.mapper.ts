import { CompanyInvitation } from '../entities/company-invitation.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicDto } from './shared.mapper';
import { CompanyInvitationItemDto, CompanyInvitationResponseDto } from '../dto/res/company-invitation-response.dto';
import { Company } from '../entities/company.entity';
import { toCompanyResponseDto } from './company.mapper';

export function toCompanyInvitationItemDto(invitation: CompanyInvitation): CompanyInvitationItemDto {
  return {
    id: invitation.id,
    user: toUserBasicDto(invitation.user),
    invitedBy: toUserBasicDto(invitation.inviter),
    message: invitation.message,
    status: invitation.status,
    createdAt: toIso(invitation.createdAt),
    updatedAt: toIso(invitation.updatedAt),
  };
}

export function toCompanyInvitationResponseDto(
  invitations: CompanyInvitation[],
  company: Company,
): CompanyInvitationResponseDto {
  return {
    invitations: invitations.map(toCompanyInvitationItemDto),
    company: toCompanyResponseDto(company),
  };
}
