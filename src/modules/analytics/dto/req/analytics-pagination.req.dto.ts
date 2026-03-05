import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IntersectionType } from '@nestjs/swagger';
import { DateRangeQueryDto } from '@/common/dto/req/date-range-query.dto';

export class AnalyticsPaginationDto extends IntersectionType(PaginationQueryDto, DateRangeQueryDto) {}
