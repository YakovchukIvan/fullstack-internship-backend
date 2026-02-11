import { OmitType } from '@nestjs/mapped-types';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyMemberResponseDto } from './company-member.res.dto';
import { CompanyResponseDto } from './company-response.dto';

export class CompanyDetailResponseDto extends OmitType(CompanyResponseDto, ['membersCount'] as const) {
  members: CompanyMemberResponseDto[];
  membersPagination: PaginationMetadataDto;
}
