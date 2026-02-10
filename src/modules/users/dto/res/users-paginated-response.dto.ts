import { UserResponseDto } from './user.res.dto';
import { PaginationMetadata } from '@/common/interfaces/pagination-metadata.interface';

export class UsersPaginatedResponseDto {
  users: UserResponseDto[];
  pagination: PaginationMetadata;
}
