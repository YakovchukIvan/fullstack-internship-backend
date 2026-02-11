import { UserResponseDto } from './user.res.dto';
import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';

export class UsersPaginatedResponseDto {
  users: UserResponseDto[];
  pagination: PaginationMetadataDto;
}
