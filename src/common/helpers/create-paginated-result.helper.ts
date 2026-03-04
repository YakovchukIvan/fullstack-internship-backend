import { Repository, FindManyOptions, ObjectLiteral, FindOptionsOrder } from 'typeorm';
import { SortOrder } from '../enums/sort-order.enum';
import { PaginationMetadataDto } from '../dto/res/pagination-metadata.dto';
import { PaginatedResultResponseDto } from '../dto/res/paginated-result.dto';

export interface PaginationOptions<T = string> {
  page?: number;
  limit?: number;
  sortBy?: T;
  order?: SortOrder;
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMetadataDto {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    limit,
    offset: (page - 1) * limit,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export async function createPaginatedResult<T extends ObjectLiteral, K extends keyof T = keyof T>(
  repository: Repository<T>,
  options: PaginationOptions<K> = {},
  findOptions: Omit<FindManyOptions<T>, 'skip' | 'take' | 'order'> = {},
): Promise<PaginatedResultResponseDto<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;

  const orderOptions: FindOptionsOrder<T> = options.sortBy
    ? ({ [options.sortBy]: options.order || SortOrder.ASC } as FindOptionsOrder<T>)
    : {};

  const [detail, total] = await repository.findAndCount({
    ...findOptions,
    order: orderOptions,
    skip: (page - 1) * limit,
    take: limit,
  });

  return { detail, pagination: buildPaginationMeta(page, limit, total) };
}
