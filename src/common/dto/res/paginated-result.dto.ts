import { PaginationMetadataDto } from './pagination-metadata.dto';

export class PaginatedResultResponseDto<T> {
  detail: T[];
  pagination: PaginationMetadataDto;
}
