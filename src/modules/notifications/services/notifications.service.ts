import { Injectable } from '@nestjs/common';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationsPaginationDto } from '../dto/req/notifications-pagination.req.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationsGateway } from '../notifications.gateway';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { CompanyInvitationEvent } from '@/modules/companies/events/company-invitation.event';
import { CompanyMembershipEvent } from '@/modules/companies/events/company-membership.event';
import { QuizCreatedEvent } from '@/modules/companies/quizzes/events/quiz-created.event';
import { CreateNotificationParams } from '../interfaces/create-notifications.interface';
import { NotificationMessages } from '../constants/notification-messages.constant';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly companyMemberRepository: CompanyMemberRepository,
  ) {}

  async create(params: CreateNotificationParams): Promise<Notification> {
    return this.notificationRepository.save(this.notificationRepository.create({ ...params }));
  }

  async createMany(params: CreateNotificationParams[]): Promise<Notification[]> {
    return this.notificationRepository.save(params.map((p) => this.notificationRepository.create({ ...p })));
  }

  async notifyQuizCreated(event: QuizCreatedEvent): Promise<void> {
    const members = await this.companyMemberRepository.findAllByCompanyId(event.companyId);

    const params = members
      .filter((m) => m.userId !== event.createdByUserId)
      .map((m) => ({
        userId: m.userId,
        type: NotificationType.QUIZ_CREATED,
        text: NotificationMessages.quizCreated(event.quizTitle, event.companyName),
        companyId: event.companyId,
      }));

    if (params.length === 0) {
      return;
    }

    const notifications = await this.createMany(params);
    notifications.forEach((n) => this.notificationsGateway.sendNotification(n.userId, n));
  }

  async notifyInvitationSent(event: CompanyInvitationEvent): Promise<void> {
    const notification = await this.create({
      userId: event.recipientId,
      type: NotificationType.INVITATION_RECEIVED,
      text: NotificationMessages.invitationReceived(event.companyName),
      companyId: event.companyId,
    });
    this.notificationsGateway.sendNotification(notification.userId, notification);
  }

  async notifyInvitationAccepted(event: CompanyMembershipEvent): Promise<void> {
    const notification = await this.create({
      userId: event.userId,
      type: NotificationType.INVITATION_ACCEPTED,
      text: NotificationMessages.invitationAccepted(event.companyName),
      companyId: event.companyId,
    });
    this.notificationsGateway.sendNotification(notification.userId, notification);
  }

  async notifyJoinRequestAccepted(event: CompanyMembershipEvent): Promise<void> {
    const notification = await this.create({
      userId: event.userId,
      type: NotificationType.JOIN_REQUEST_ACCEPTED,
      text: NotificationMessages.joinRequestAccepted(event.companyName),
      companyId: event.companyId,
    });
    this.notificationsGateway.sendNotification(notification.userId, notification);
  }

  async notifyJoinRequestCreated(event: CompanyMembershipEvent): Promise<void> {
    const notification = await this.create({
      userId: event.userId,
      type: NotificationType.JOIN_REQUEST_SENT,
      text: NotificationMessages.joinRequestCreated(event.companyName),
      companyId: event.companyId,
    });
    this.notificationsGateway.sendNotification(notification.userId, notification);
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
