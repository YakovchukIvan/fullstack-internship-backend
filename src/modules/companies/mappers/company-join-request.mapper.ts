import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicResponseDto } from './company-basic.mapper';
import { Company } from '../entities/company.entity';
import { toCompanyResponseDto } from './company.mapper';
import {
  CompanyJoinRequestItemResponseDto,
  CompanyJoinRequestResponseDto,
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

export function toCompanyJoinRequestResponseDto(
  joinRequest: CompanyJoinRequest[],
  company: Company,
): CompanyJoinRequestResponseDto {
  return {
    joinRequest: joinRequest.map(toCompanyJoinRequestItemResponseDto),
    company: toCompanyResponseDto(company),
  };
}
