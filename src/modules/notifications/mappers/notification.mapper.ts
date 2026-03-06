import { Notification } from '../entities/notification.entity';
import { NotificationResponseDto } from '../dto/res/notification.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toNotificationResponseDto(notification: Notification): NotificationResponseDto {
  return {
    id: notification.id,
    type: notification.type,
    text: notification.text,
    isRead: notification.isRead,
    isSeen: notification.isSeen,
    companyId: notification.companyId,
    quizId: notification.quizId,
    createdAt: toIso(notification.createdAt),
  };
}
