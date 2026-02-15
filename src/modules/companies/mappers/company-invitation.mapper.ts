import { CompanyInvitation } from '../entities/company-invitation.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicResponseDto } from './company-basic.mapper';
import { Company } from '../entities/company.entity';
import { toCompanyResponseDto } from './company.mapper';
import {
  CompanyInvitationItemResponseDto,
  CompanyInvitationResponseDto,
} from '../dto/res/requests/company-invitation.res.dto';

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

export function toCompanyInvitationResponseDto(
  invitations: CompanyInvitation[],
  company: Company,
): CompanyInvitationResponseDto {
  return {
    invitations: invitations.map(toCompanyInvitationItemResponseDto),
    company: toCompanyResponseDto(company),
  };
}
