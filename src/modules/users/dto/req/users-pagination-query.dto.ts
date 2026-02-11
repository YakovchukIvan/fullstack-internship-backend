import { IsEnum, IsOptional } from 'class-validator';
import { UserSortField } from '@/common/enums/user-sort-field.enum';
import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';

export class UsersPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserSortField)
  sortBy: UserSortField = UserSortField.CREATED_AT;
}
