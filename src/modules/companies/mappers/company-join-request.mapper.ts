import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicDto } from './shared.mapper';
import { Company } from '../entities/company.entity';
import { CompanyJoinRequestItemDto, CompanyJoinRequestResponseDto } from '../dto/res/company-join-request-response.dto';
import { toCompanyResponseDto } from './company.mapper';

export function toCompanyJoinRequestItemDto(request: CompanyJoinRequest): CompanyJoinRequestItemDto {
  return {
    id: request.id,
    user: toUserBasicDto(request.user),
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
    joinRequest: joinRequest.map(toCompanyJoinRequestItemDto),
    company: toCompanyResponseDto(company),
  };
}
