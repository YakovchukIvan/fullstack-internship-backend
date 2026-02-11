import { CompanyMember } from '../entities/company-member.entity';
import { CompanyMemberResponseDto } from '../dto/res/company-member.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toCompanyMemberResponseDto(member: CompanyMember): CompanyMemberResponseDto {
  return {
    id: member.id,
    role: member.role,
    user: {
      id: member.user.id,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      avatarUrl: member.user.avatarUrl,
    },
    createdAt: toIso(member.createdAt),
    updatedAt: toIso(member.updatedAt),
  };
}
