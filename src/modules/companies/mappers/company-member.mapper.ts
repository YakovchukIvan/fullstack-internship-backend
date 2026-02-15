import { CompanyMember } from '../entities/company-member.entity';
import { CompanyMemberResponseDto } from '../dto/res/members/company-member.res.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicResponseDto } from './company-basic.mapper';

export function toCompanyMemberResponseDto(member: CompanyMember): CompanyMemberResponseDto {
  return {
    id: member.id,
    role: member.role,
    user: toUserBasicResponseDto(member.user),
    createdAt: toIso(member.createdAt),
    updatedAt: toIso(member.updatedAt),
  };
}
