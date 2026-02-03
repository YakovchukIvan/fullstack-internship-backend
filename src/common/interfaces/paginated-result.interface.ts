import { PaginationMetadata } from './pagination-metadata.interface';

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}
