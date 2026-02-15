import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { UserMembershipResponseDto } from './user-membership.res.dto';

export class UserMembershipListResponseDto extends PaginatedBaseResponseDto {
  membership: UserMembershipResponseDto[];
}
