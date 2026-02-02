import { SortOrder } from '../enums/sort-order.enum';

export const QUERY_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  ORDER: SortOrder.DESC,
  SORT_BY: 'createdAt',
} as const;
