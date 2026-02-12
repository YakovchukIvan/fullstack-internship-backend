import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CompanyInvitationSortField } from '../../enums/company-sort-field.enum';

export class CompanyInvitationsPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CompanyInvitationSortField)
  sortBy?: CompanyInvitationSortField = CompanyInvitationSortField.CREATED_AT;
}
