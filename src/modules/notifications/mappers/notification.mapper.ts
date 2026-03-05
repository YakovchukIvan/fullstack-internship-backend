import { Notification } from '../entities/notification.entity';
import { NotificationResponseDto } from '../dto/res/notification.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toNotificationResponseDto(notification: Notification): NotificationResponseDto {
  return {
    id: notification.id,
    type: notification.type,
    text: notification.text,
    isRead: notification.isRead,
    companyId: notification.companyId,
    createdAt: toIso(notification.createdAt),
  };
}
