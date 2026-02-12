import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { CompanyJoinRequestResponseDto } from '../dto/res/company-join-request-response.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { toUserBasicDto, toCompanyBasicDto } from './shared.mapper';

export function toCompanyJoinRequestResponseDto(request: CompanyJoinRequest): CompanyJoinRequestResponseDto {
  return {
    id: request.id,
    user: toUserBasicDto(request.user),
    company: toCompanyBasicDto(request.company),
    message: request.message,
    status: request.status,
    createdAt: toIso(request.createdAt),
    updatedAt: toIso(request.updatedAt),
  };
}
