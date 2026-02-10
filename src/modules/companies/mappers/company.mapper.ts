import { Company } from '../entities/company.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { CompanyResponseDto, CompanyMemberResponseDto } from '../dto/res/company-response.dto';

export function toCompanyResponseDto(company: Company, membersCount?: number): CompanyResponseDto {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description,
    avatarUrl: company.avatarUrl,
    isVisible: company.isVisible,
    ownerId: company.ownerId,
    membersCount: membersCount ?? company.members?.length ?? 0,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
}

export function toCompanyMemberResponseDto(member: CompanyMember): CompanyMemberResponseDto {
  return {
    id: member.id,
    role: member.role,
    user: {
      id: member.user.id,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      avatarUrl: member.user.avatarUrl,
    },
    createdAt: member.createdAt.toISOString(),
  };
}
