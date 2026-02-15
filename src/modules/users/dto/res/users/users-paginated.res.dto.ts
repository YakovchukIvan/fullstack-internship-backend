import { UserResponseDto } from './user.res.dto';
import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';

export class UsersPaginatedBaseResponseDto extends PaginatedBaseResponseDto {
  users: UserResponseDto[];
}
