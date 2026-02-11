import { Type } from 'class-transformer';
import { PaginationMetadataDto } from './pagination-metadata.dto';

export class PaginatedResultDto<T> {
  detail: T[];

  @Type(() => PaginationMetadataDto)
  pagination: PaginationMetadataDto;

  constructor(detail: T[], pagination: PaginationMetadataDto) {
    this.detail = detail;
    this.pagination = pagination;
  }
}
