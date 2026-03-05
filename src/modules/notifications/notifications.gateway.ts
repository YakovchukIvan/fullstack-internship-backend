import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { AppLogger } from '@/common/logger/app-logger';
import { NotificationsAuthService } from './services/notifications-auth.service';

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
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(NotificationsGateway.name);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const userId = await this.notificationsAuthService.getUserIdFromSocket(client);
      client.data = { userId };

      await client.join(userId);
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
