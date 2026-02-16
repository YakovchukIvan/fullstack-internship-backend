import { User } from '@/modules/users/entities/user.entity';
import { Company } from '../entities/company.entity';
import { UserBasicResponseDto } from '@/common/dto/res/user-basic.dto';
import { CompanyBasicResponseDto } from '../dto/res/company/company-basic.dto.res';

export function toUserBasicResponseDto(user: User): UserBasicResponseDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
  };
}

export function toCompanyBasicResponseDto(company: Company): CompanyBasicResponseDto {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description,
    avatarUrl: company.avatarUrl,
  };
}
