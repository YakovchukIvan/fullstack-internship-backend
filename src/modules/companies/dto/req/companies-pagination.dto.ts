import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

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
