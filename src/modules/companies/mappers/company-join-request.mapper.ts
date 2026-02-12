import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { CompanyJoinRequestResponseDto } from '../dto/res/company-join-request-response.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toCompanyJoinRequestResponseDto(request: CompanyJoinRequest): CompanyJoinRequestResponseDto {
  return {
    id: request.id,
    user: {
      id: request.user.id,
      email: request.user.email,
      firstName: request.user.firstName,
      lastName: request.user.lastName,
      avatarUrl: request.user.avatarUrl,
    },
    company: {
      id: request.company.id,
      name: request.company.name,
      slug: request.company.slug,
      description: request.company.description,
      avatarUrl: request.company.avatarUrl,
    },
    createdAt: toIso(request.createdAt),
    updatedAt: toIso(request.updatedAt),
  };
}
