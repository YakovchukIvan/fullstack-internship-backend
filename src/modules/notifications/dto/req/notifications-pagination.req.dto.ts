import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class NotificationsPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: string }) => value === 'true')
  isRead?: boolean;
}
