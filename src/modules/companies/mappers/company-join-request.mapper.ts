import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicResponseDto } from './company-basic.mapper';
import { toCompanyResponseDto } from './company.mapper';
import {
  CompanyJoinRequestItemResponseDto,
  UserJoinRequestItemResponseDto,
} from '../dto/res/requests/company-join-request.res.dto';

export function toCompanyJoinRequestItemResponseDto(request: CompanyJoinRequest): CompanyJoinRequestItemResponseDto {
  return {
    id: request.id,
    user: toUserBasicResponseDto(request.user),
    status: request.status,
    createdAt: toIso(request.createdAt),
    updatedAt: toIso(request.updatedAt),
  };
}

export function toUserJoinRequestItemResponseDto(joinRequest: CompanyJoinRequest): UserJoinRequestItemResponseDto {
  return {
    joinRequest: toCompanyJoinRequestItemResponseDto(joinRequest),
    company: toCompanyResponseDto(joinRequest.company),
  };
}
