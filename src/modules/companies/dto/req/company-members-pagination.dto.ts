import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum CompanyMemberSortField {
  ROLE = 'role',
  CREATED_AT = 'createdAt',
}

export class CompanyMembersPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CompanyMemberSortField)
  sortBy: CompanyMemberSortField = CompanyMemberSortField.CREATED_AT;
}
