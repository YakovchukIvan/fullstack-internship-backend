import { IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { QUERY_DEFAULTS } from '@/common/constants/query-defaults.constant';
import { SortOrder } from '@/common/enums/sort-order.enum';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = QUERY_DEFAULTS.PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(QUERY_DEFAULTS.MAX_LIMIT)
  limit: number = QUERY_DEFAULTS.LIMIT;

  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = QUERY_DEFAULTS.ORDER;
}
