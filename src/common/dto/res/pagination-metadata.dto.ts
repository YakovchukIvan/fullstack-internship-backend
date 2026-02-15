export class PaginationMetadataDto {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginatedBaseResponseDto {
  pagination: PaginationMetadataDto;
}
