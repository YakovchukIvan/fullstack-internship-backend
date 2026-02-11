import { Company } from '../entities/company.entity';
import { CompanyResponseDto } from '../dto/res/company-response.dto';
import { toCompanyBaseDto } from './company.base.mapper';

export function toCompanyResponseDto(company: Company, membersCount: number): CompanyResponseDto {
  return {
    ...toCompanyBaseDto(company),
    membersCount,
  };
}
