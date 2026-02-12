import { CompanyInvitation } from '../entities/company-invitation.entity';
import { CompanyInvitationResponseDto } from '../dto/res/company-invitation-response.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toCompanyInvitationResponseDto(invitation: CompanyInvitation): CompanyInvitationResponseDto {
  return {
    id: invitation.id,
    user: {
      id: invitation.user.id,
      email: invitation.user.email,
      firstName: invitation.user.firstName,
      lastName: invitation.user.lastName,
      avatarUrl: invitation.user.avatarUrl,
    },
    company: {
      id: invitation.company.id,
      name: invitation.company.name,
      slug: invitation.company.slug,
      description: invitation.company.description,
      avatarUrl: invitation.company.avatarUrl,
    },
    invitedBy: {
      id: invitation.inviter.id,
      email: invitation.inviter.email,
      firstName: invitation.inviter.firstName,
      lastName: invitation.inviter.lastName,
    },
    createdAt: toIso(invitation.createdAt),
    updatedAt: toIso(invitation.updatedAt),
  };
}
