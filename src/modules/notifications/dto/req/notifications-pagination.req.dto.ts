import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationType } from '../../enums/notification-type.enum';

export class NotificationsPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: string }) => value === 'true')
  isRead?: boolean;
}

export class CreateTestNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsUUID()
  companyId: string | null;
}
