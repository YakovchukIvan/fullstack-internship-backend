export interface PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
