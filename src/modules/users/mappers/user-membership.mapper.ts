import { CompanyMember } from '@/modules/companies/entities/company-member.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { UserMembershipResponseDto } from '../dto/res/membership/user-membership-list.res.dto';

export function toUserMembershipResponseDto(member: CompanyMember): UserMembershipResponseDto {
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
