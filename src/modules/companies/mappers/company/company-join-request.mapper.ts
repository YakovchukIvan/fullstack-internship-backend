import { CompanyJoinRequest } from '../../entities/company-join-request.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toMemberBasicResponseDto } from '../company-basic.mapper';
import { CompanyJoinRequestItemResponseDto } from '../../dto/res/company/company-join-request.res.dto';

export function toCompanyJoinRequestItemResponseDto(request: CompanyJoinRequest): CompanyJoinRequestItemResponseDto {
  return {
    id: request.id,
    user: toMemberBasicResponseDto(request.user),
    status: request.status,
    createdAt: toIso(request.createdAt),
  };
}
