import { User } from '@/modules/users/entities/user.entity';
import { Company } from '../entities/company.entity';
import { UserBasicDto } from '@/common/dto/res/user-basic.dto';
import { CompanyBasicDto } from '../dto/res/company-basic.dto';

export function toUserBasicDto(user: User): UserBasicDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
  };
}

export function toCompanyBasicDto(company: Company): CompanyBasicDto {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    description: company.description,
    avatarUrl: company.avatarUrl,
  };
}
