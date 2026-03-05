import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationsPaginationDto } from './dto/req/notifications-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { Notification } from './entities/notification.entity';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  text: string;
  companyId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async create(params: CreateNotificationParams): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: params.userId,
      type: params.type,
      text: params.text,
      companyId: params.companyId ?? null,
    });
    return this.notificationRepository.save(notification);
  }

  async createMany(params: CreateNotificationParams[]): Promise<Notification[]> {
    const notifications = params.map((p) =>
      this.notificationRepository.create({
        userId: p.userId,
        type: p.type,
        text: p.text,
        companyId: p.companyId ?? null,
      }),
    );
    return this.notificationRepository.save(notifications);
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async findAllByUser(
    userId: string,
    dto: NotificationsPaginationDto,
  ): Promise<PaginatedResultResponseDto<Notification> & { unreadCount: number }> {
    const [result, unreadCount] = await Promise.all([
      this.notificationRepository.findPaginatedByUser(userId, dto),
      this.notificationRepository.countUnread(userId),
    ]);
    return { ...result, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOneByIdAndUserOrFail(id, userId);
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
