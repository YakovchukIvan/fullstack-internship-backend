import { Company } from '../entities/company.entity';
import { CompanyDetailResponseDto } from '../dto/res/company-detail-response.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toCompanyDetailResponseDto(company: Company): CompanyDetailResponseDto {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description,
    avatarUrl: company.avatarUrl,
    isVisible: company.isVisible,
    ownerId: company.ownerId,
    membersCount: company.membersCount,
    createdAt: toIso(company.createdAt),
    updatedAt: toIso(company.updatedAt),
  };
}
