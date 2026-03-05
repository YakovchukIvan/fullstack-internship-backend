import { CompanyJoinRequest } from '@/modules/companies/entities/company-join-request.entity';
import { UserJoinRequestItemResponseDto } from '../../dto/res/members/user-join-requests-list.res.dto';
import { UserInvitationItemResponseDto } from '../../dto/res/members/user-invitations-list.res.dto';
import { CompanyInvitation } from '@/modules/companies/entities/company-invitation.entity';
import { toCompanyJoinRequestItemResponseDto } from '@/modules/companies/mappers/company/company-join-request.mapper';
import { toCompanyInvitationItemResponseDto } from '@/modules/companies/mappers/company/company-invitation.mapper';
import { toCompanyBasicResponseDto } from '../company-basic.mapper';

export function toMembersJoinRequestItemResponseDto(joinRequest: CompanyJoinRequest): UserJoinRequestItemResponseDto {
  return {
    joinRequest: toCompanyJoinRequestItemResponseDto(joinRequest),
    company: toCompanyBasicResponseDto(joinRequest.company),
  };
}

export function toMembersInvitationItemResponseDto(invitation: CompanyInvitation): UserInvitationItemResponseDto {
  return {
    invitation: toCompanyInvitationItemResponseDto(invitation),
    company: toCompanyBasicResponseDto(invitation.company),
  };
}
