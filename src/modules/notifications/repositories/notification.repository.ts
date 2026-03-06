import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { NotificationsPaginationDto } from '../dto/req/notifications-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  async findOneByIdAndUserOrFail(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne({ where: { id, userId } });
    GuardAssertions.exists(notification, 'Notification not found');
    return notification;
  }

  async findPaginatedByUser(
    userId: string,
    dto: NotificationsPaginationDto,
  ): Promise<PaginatedResultResponseDto<Notification>> {
    const where = dto.isRead !== undefined ? { userId, isRead: dto.isRead } : { userId };
    return createPaginatedResult(this, dto, { where });
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({ where: { userId, isRead: false } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.update({ userId, isRead: false }, { isRead: true });
  }

  async markAllAsSeen(userId: string): Promise<void> {
    await this.update({ userId, isSeen: false }, { isSeen: true });
  }

  async findUnseenByUser(userId: string): Promise<Notification[]> {
    return this.find({
      where: { userId, isSeen: false },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteOldRead(olderThan: Date): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .where('is_read = true AND created_at < :olderThan', { olderThan })
      .execute();
  }
}
