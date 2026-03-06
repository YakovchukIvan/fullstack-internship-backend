import { Injectable } from '@nestjs/common';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationsPaginationDto } from '../dto/req/notifications-pagination.req.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationsGateway } from '../notifications.gateway';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { CompanyInvitationEvent } from '@/modules/companies/events/company-invitation.event';
import { CompanyInvitationAcceptedEvent } from '@/modules/companies/events/company-invitation-accepted.event';
import { CompanyJoinRequestEvent } from '@/modules/companies/events/company-join-request.event';
import { CompanyJoinRequestAcceptedEvent } from '@/modules/companies/events/company-join-request-accepted.event';
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
    const notification = await this.notificationRepository.save(this.notificationRepository.create({ ...params }));
    this.notificationsGateway.sendNotification(notification.userId, notification);
    return notification;
  }

  async createMany(params: CreateNotificationParams[]): Promise<Notification[]> {
    const notifications = await this.notificationRepository.save(
      params.map((p) => this.notificationRepository.create({ ...p })),
    );
    notifications.forEach((n) => this.notificationsGateway.sendNotification(n.userId, n));
    return notifications;
  }

  private async createManyIfNotEmpty(params: CreateNotificationParams[]): Promise<void> {
    if (params.length === 0) {
      return;
    }
    await this.createMany(params);
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
    await this.createManyIfNotEmpty(params);
  }

  async notifyInvitationSent(event: CompanyInvitationEvent): Promise<void> {
    await this.create({
      userId: event.recipientId,
      type: NotificationType.INVITATION_RECEIVED,
      text: NotificationMessages.invitationReceived(event.companyName),
      companyId: event.companyId,
    });
  }

  async notifyInvitationAccepted(event: CompanyInvitationAcceptedEvent): Promise<void> {
    const admins = await this.companyMemberRepository.findOwnerAndAdminsByCompanyId(event.companyId);
    const params = admins
      .filter((a) => a.userId !== event.userId)
      .map((a) => ({
        userId: a.userId,
        type: NotificationType.INVITATION_ACCEPTED,
        text: NotificationMessages.invitationAccepted(event.userName, event.companyName),
        companyId: event.companyId,
      }));
    await this.createManyIfNotEmpty(params);
  }

  async notifyJoinRequestSent(event: CompanyJoinRequestEvent): Promise<void> {
    const admins = await this.companyMemberRepository.findOwnerAndAdminsByCompanyId(event.companyId);
    const params = admins.map((admin) => ({
      userId: admin.userId,
      type: NotificationType.JOIN_REQUEST_SENT,
      text: NotificationMessages.joinRequestSent(event.requesterName, event.companyName),
      companyId: event.companyId,
    }));
    await this.createManyIfNotEmpty(params);
  }

  async notifyJoinRequestAccepted(event: CompanyJoinRequestAcceptedEvent): Promise<void> {
    const [userParams, adminParams] = await Promise.all([
      Promise.resolve([
        {
          userId: event.userId,
          type: NotificationType.JOIN_REQUEST_ACCEPTED,
          text: NotificationMessages.joinRequestAccepted(event.companyName),
          companyId: event.companyId,
        },
      ]),
      this.companyMemberRepository.findOwnerAndAdminsByCompanyId(event.companyId).then((admins) =>
        admins
          .filter((a) => a.userId !== event.userId)
          .map((a) => ({
            userId: a.userId,
            type: NotificationType.JOIN_REQUEST_ACCEPTED,
            text: NotificationMessages.joinRequestAcceptedAdmin(event.userName, event.companyName),
            companyId: event.companyId,
          })),
      ),
    ]);
    await this.createManyIfNotEmpty([...userParams, ...adminParams]);
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
