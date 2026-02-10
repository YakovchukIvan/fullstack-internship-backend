import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export enum CompanyMemberSortField {
  ROLE = 'role',
  CREATED_AT = 'createdAt',
}

export class CompanyMembersPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CompanyMemberSortField)
  sortBy: CompanyMemberSortField = CompanyMemberSortField.CREATED_AT;
}
