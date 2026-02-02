import { Repository, FindManyOptions, ObjectLiteral, FindOptionsOrder } from 'typeorm';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { PaginationMetadata } from '../interfaces/pagination-metadata.interface';
import { SortOrder } from '../enums/sort-order.enum';

export interface PaginationOptions<T = string> {
  page?: number;
  limit?: number;
  sortBy?: T;
  order?: SortOrder;
}

export async function createPaginatedResult<T extends ObjectLiteral, K extends keyof T = keyof T>(
  repository: Repository<T>,
  options: PaginationOptions<K> = {},
  findOptions: Omit<FindManyOptions<T>, 'skip' | 'take' | 'order'> = {},
): Promise<PaginatedResult<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const offset = (page - 1) * limit;

  const orderOptions: FindOptionsOrder<T> = options.sortBy
    ? ({ [options.sortBy]: options.order || SortOrder.ASC } as FindOptionsOrder<T>)
    : {};

  const [data, total] = await repository.findAndCount({
    ...findOptions,
    order: orderOptions,
    skip: offset,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMetadata = {
    total,
    limit,
    offset,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return { data, pagination };
}
