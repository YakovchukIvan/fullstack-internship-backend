import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { AppLogger } from '@/common/logger/app-logger';
import { NotificationsAuthService } from './services/notifications-auth.service';
import { NotificationRepository } from './repositories/notification.repository';
import { UNSEEN_NOTIFICATIONS_LIMIT } from './constants/unseen_notifications_limit.constant';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly notificationsAuthService: NotificationsAuthService,
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(NotificationsGateway.name);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const userId = await this.notificationsAuthService.getUserIdFromSocket(client);
      client.data = { userId };
      await client.join(userId);

      const unseen = await this.notificationRepository.findUnseenByUser(userId);

      if (unseen.length > 0 && unseen.length <= UNSEEN_NOTIFICATIONS_LIMIT) {
        unseen.forEach((n) => client.emit('notification', n));
      } else if (unseen.length > UNSEEN_NOTIFICATIONS_LIMIT) {
        client.emit('notification', {
          type: 'summary',
          text: `You have ${unseen.length} new notifications`,
        });
      }

      if (unseen.length > 0) {
        await this.notificationRepository.markAllAsSeen(userId);
      }

      this.logger.log(`Client connected: ${client.id} userId: ${userId}`);
    } catch {
      this.logger.log(`Client disconnected: ${client.id} reason: Unauthorized`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendNotification(userId: string, notification: Notification): void {
    this.server.to(userId).emit('notification', notification);
  }
}
