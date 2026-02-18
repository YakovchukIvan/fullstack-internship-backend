import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyBasicResponseDto } from '@/modules/companies/dto/res/company/company-basic.dto.res';
import { CompanyJoinRequestItemResponseDto } from '@/modules/companies/dto/res/requests/company-join-request.res.dto';

export class UserJoinRequestItemResponseDto {
  joinRequest: CompanyJoinRequestItemResponseDto;
  company: CompanyBasicResponseDto;
}

export class UserJoinRequestsListResponseDto extends PaginatedBaseResponseDto {
  joinRequests: UserJoinRequestItemResponseDto[];
}
