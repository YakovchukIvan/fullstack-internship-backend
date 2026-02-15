import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CompanyMemberSortField } from '../../../enums/company-sort-field.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';

export class CompanyMembersPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CompanyMemberSortField)
  sortBy: CompanyMemberSortField = CompanyMemberSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(CompanyRole)
  role?: CompanyRole;
}
