import { CompanyMember } from '../entities/company-member.entity';
import { CompanyMemberResponseDto } from '../dto/res/company-member.res.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicDto } from './shared.mapper';

export function toCompanyMemberResponseDto(member: CompanyMember): CompanyMemberResponseDto {
  return {
    id: member.id,
    role: member.role,
    user: toUserBasicDto(member.user),
    createdAt: toIso(member.createdAt),
    updatedAt: toIso(member.updatedAt),
  };
}
