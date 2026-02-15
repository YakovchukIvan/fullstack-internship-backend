import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CompanySortField } from '../../../enums/company-sort-field.enum';

export class CompaniesPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CompanySortField)
  sortBy: CompanySortField = CompanySortField.CREATED_AT;
}
