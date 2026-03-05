import { CompanyMember } from '../../entities/company-member.entity';
import { CompanyMemberResponseDto } from '../../dto/res/company/company-member.res.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { toMemberBasicResponseDto } from '../company-basic.mapper';

export function toCompanyMemberResponseDto(member: CompanyMember): CompanyMemberResponseDto {
  return {
    id: member.id,
    role: member.role,
    user: toMemberBasicResponseDto(member.user),
    createdAt: toIso(member.createdAt),
    updatedAt: toIso(member.updatedAt),
  };
}
