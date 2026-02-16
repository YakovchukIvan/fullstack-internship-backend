import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { UserSortField } from '../../enums/user-sort-field.enum';

export class UsersPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(UserSortField)
  sortBy: UserSortField = UserSortField.CREATED_AT;
}
