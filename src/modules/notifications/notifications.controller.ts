import { Body, Post } from '@nestjs/common';
import { Controller, Get, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { NotificationsRoutes } from './routes/notifications.routes';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import {
  NotificationsListResponseDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
} from './dto/res/notification.res.dto';
import { CreateTestNotificationDto, NotificationsPaginationDto } from './dto/req/notifications-pagination.req.dto';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import { NotificationsService } from './notifications.service';
import { toNotificationResponseDto } from './mappers/notification.mapper';

@Controller(NotificationsRoutes.ROOT)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiEndpoint(NotificationsListResponseDto, HttpStatus.OK)
  @ResponseMessage('Notifications fetched successfully')
  async getMyNotifications(
    @CurrentUser() user: JwtPayload,
    @Query() dto: NotificationsPaginationDto,
  ): Promise<NotificationsListResponseDto> {
    const result = await this.notificationsService.findAllByUser(user.sub, dto);

    return {
      notifications: result.detail.map(toNotificationResponseDto),
      unreadCount: result.unreadCount,
      pagination: result.pagination,
    };
  }

  @Get(NotificationsRoutes.UNREAD_COUNT)
  @ApiEndpoint(UnreadCountResponseDto, HttpStatus.OK)
  @ResponseMessage('Unread count fetched successfully')
  async getUnreadCount(@CurrentUser() user: JwtPayload): Promise<{ count: number }> {
    const count = await this.notificationsService.countUnread(user.sub);
    return { count };
  }

  @Post('test')
  async createTest(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateTestNotificationDto,
  ): Promise<{ notification: NotificationResponseDto }> {
    const notification = await this.notificationsService.create({
      userId: user.sub,
      type: body.type,
      text: body.text,
      companyId: body.companyId,
    });
    return { notification: toNotificationResponseDto(notification) };
  }

  @Patch(NotificationsRoutes.READ)
  @ApiEndpoint(NotificationResponseDto, HttpStatus.OK)
  @ResponseMessage('Notification marked as read')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ notification: NotificationResponseDto }> {
    const notification = await this.notificationsService.markAsRead(notificationId, user.sub);
    return { notification: toNotificationResponseDto(notification) };
  }

  @Patch(NotificationsRoutes.READ_ALL)
  @ApiEndpoint(Object, HttpStatus.OK)
  @ResponseMessage('All notifications marked as read')
  async markAllAsRead(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.notificationsService.markAllAsRead(user.sub);
  }
}
