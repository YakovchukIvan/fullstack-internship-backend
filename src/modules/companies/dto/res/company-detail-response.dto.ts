import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyMemberResponseDto } from './company-member.res.dto';
import { CompanyResponseDto } from './company-response.dto';

export class CompanyDetailResponseDto extends CompanyResponseDto {
  members: CompanyMemberResponseDto[];
  membersPagination: PaginationMetadataDto;
}
