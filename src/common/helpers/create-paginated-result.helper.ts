import { Repository, FindManyOptions, ObjectLiteral, FindOptionsOrder } from 'typeorm';
import { SortOrder } from '../enums/sort-order.enum';
import { PaginationMetadataDto } from '../dto/res/pagination-metadata.dto';
import { PaginatedResultDto } from '../dto/res/paginated-result.dto';

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
): Promise<PaginatedResultDto<T>> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const offset = (page - 1) * limit;

  const orderOptions: FindOptionsOrder<T> = options.sortBy
    ? ({ [options.sortBy]: options.order || SortOrder.ASC } as FindOptionsOrder<T>)
    : {};

  const [detail, total] = await repository.findAndCount({
    ...findOptions,
    order: orderOptions,
    skip: offset,
    take: limit,
  });

  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMetadataDto = {
    total,
    limit,
    offset,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return { detail, pagination };
}
