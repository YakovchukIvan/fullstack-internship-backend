import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { UserJoinRequestItemResponseDto } from '@/modules/companies/dto/res/requests/company-join-request.res.dto';

export class UserJoinRequestsListResponseDto extends PaginatedBaseResponseDto {
  joinRequests: UserJoinRequestItemResponseDto[];
}
