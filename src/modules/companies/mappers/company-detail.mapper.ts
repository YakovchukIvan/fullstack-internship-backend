import { Company } from '../entities/company.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { CompanyDetailResponseDto } from '../dto/res/company-detail-response.dto';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';

import { toCompanyResponseDto } from './company.mapper';
import { toCompanyMemberResponseDto } from './company-member.mapper';

export function toCompanyDetailResponseDto(
  company: Company,
  members: CompanyMember[],
  membersPagination: PaginationMetadataDto,
): CompanyDetailResponseDto {
  return {
    ...toCompanyResponseDto(company),
    members: members.map(toCompanyMemberResponseDto),
    membersPagination,
  };
}
