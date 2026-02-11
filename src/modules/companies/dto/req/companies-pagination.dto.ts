import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum CompanySortField {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  SLUG = 'slug',
}

export class CompaniesPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CompanySortField)
  sortBy: CompanySortField = CompanySortField.CREATED_AT;
}
