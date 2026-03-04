import { CompanyMember } from '@/modules/companies/entities/company-member.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { UserMembersResponseDto } from '../../dto/res/members/user-membership-list.res.dto';

export function toUserMembersResponseDto(member: CompanyMember): UserMembersResponseDto {
  return {
    id: member.id,
    company: {
      name: member.company.name,
      slug: member.company.slug,
    },
    role: member.role,
    joinedAt: toIso(member.createdAt),
  };
}
