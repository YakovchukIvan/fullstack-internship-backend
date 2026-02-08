import { plainToInstance } from 'class-transformer';
import { Company } from '../entities/company.entity';
import { CompanyResponseDto } from '../dto/res/company-response.dto';

export function toCompanyResponseDto(company: Company): CompanyResponseDto {
  return plainToInstance(CompanyResponseDto, company, {
    excludeExtraneousValues: true,
  });
}
