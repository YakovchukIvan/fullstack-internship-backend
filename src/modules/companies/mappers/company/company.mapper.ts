import { Company } from '../../entities/company.entity';
import { CompanyResponseDto } from '../../dto/res/company/company-response.res.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { toIso } from '@/common/helpers/date.transformer';

export function toCompanyResponseDto(
  company: Company,
  companyMemberRole: CompanyRole | null = null,
): CompanyResponseDto {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description,
    avatarUrl: company.avatarUrl,
    isVisible: company.isVisible,
    ownerId: company.ownerId,
    membersCount: company.membersCount,
    companyMemberRole,
    createdAt: toIso(company.createdAt),
    updatedAt: toIso(company.updatedAt),
  };
}
