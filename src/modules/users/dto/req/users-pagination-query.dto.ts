import { IsEnum } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { UserSortField } from '@/common/enums/user-sort-field.enum';

export class UsersPaginationQueryDto extends PaginationQueryDto {
  @IsEnum(UserSortField, { message: 'Invalid sort field for users' })
  sortBy: UserSortField = UserSortField.CREATED_AT;
}
