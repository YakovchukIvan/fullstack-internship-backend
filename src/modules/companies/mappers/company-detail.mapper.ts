import { Company } from '../entities/company.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { CompanyDetailResponseDto } from '../dto/res/company-detail-response.dto';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';

import { toCompanyBaseDto } from './company.base.mapper';
import { toCompanyMemberResponseDto } from './company-member.mapper';

export function toCompanyDetailResponseDto(
  company: Company,
  members: CompanyMember[],
  membersPagination: PaginationMetadataDto,
): CompanyDetailResponseDto {
  return {
    ...toCompanyBaseDto(company),
    members: members.map(toCompanyMemberResponseDto),
    membersPagination,
  };
}
