import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CompanyRequestSortField } from '../../../enums/company-sort-field.enum';

export class CompanyPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CompanyRequestSortField)
  sortBy?: CompanyRequestSortField = CompanyRequestSortField.CREATED_AT;
}
