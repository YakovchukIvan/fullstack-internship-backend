import { PaginationMetadataDto } from '@/common/dto/res/pagination-metadata.dto';
import { CompanyResponseDto } from './company-response.dto';

export class CompaniesPaginatedResponseDto {
  companies: CompanyResponseDto[];
  pagination: PaginationMetadataDto;
}
