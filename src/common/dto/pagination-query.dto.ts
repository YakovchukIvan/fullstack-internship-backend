import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';
import { QUERY_DEFAULTS } from '../constants/query-defaults.constant';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = QUERY_DEFAULTS.PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(QUERY_DEFAULTS.MAX_LIMIT, { message: `Limit must not exceed ${QUERY_DEFAULTS.MAX_LIMIT}` })
  limit: number = QUERY_DEFAULTS.LIMIT;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Order must be ASC or DESC' })
  order: SortOrder = QUERY_DEFAULTS.ORDER;
}
