import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { NotificationType } from '../../enums/notification-type.enum';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  text: string;
  isRead: boolean;
  isSeen: boolean;
  companyId: string | null;
  quizId: string | null;
  createdAt: string;
}

export class NotificationsListResponseDto extends PaginatedBaseResponseDto {
  notifications: NotificationResponseDto[];
  unreadCount: number;
}

export class UnreadCountResponseDto {
  count: number;
}
