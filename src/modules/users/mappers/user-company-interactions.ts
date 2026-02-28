import { CompanyJoinRequest } from '@/modules/companies/entities/company-join-request.entity';
import { UserJoinRequestItemResponseDto } from '../dto/res/membership/user-join-requests-list.res.dto';
import { UserInvitationItemResponseDto } from '../dto/res/membership/user-invitations-list.res.dto';
import { CompanyInvitation } from '@/modules/companies/entities/company-invitation.entity';
import { toCompanyJoinRequestItemResponseDto } from '@/modules/companies/mappers/company-join-request.mapper';
import { toCompanyResponseDto } from '@/modules/companies/mappers/company.mapper';
import { toCompanyInvitationItemResponseDto } from '@/modules/companies/mappers/company-invitation.mapper';

export function toUserJoinRequestItemResponseDto(joinRequest: CompanyJoinRequest): UserJoinRequestItemResponseDto {
  return {
    joinRequest: toCompanyJoinRequestItemResponseDto(joinRequest),
    company: toCompanyResponseDto(joinRequest.company),
  };
}

export function toUserInvitationItemResponseDto(invitations: CompanyInvitation): UserInvitationItemResponseDto {
  return {
    invitations: toCompanyInvitationItemResponseDto(invitations),
    company: toCompanyResponseDto(invitations.company),
  };
}
