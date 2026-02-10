import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';
import { QUERY_DEFAULTS } from '../constants/query-defaults.constant';

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
