import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationsService } from './services/notifications.service';
import { NotificationsAuthService } from './services/notifications-auth.service';
import { NotificationsListenerService } from './services/notifications-listener.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { AuthModule } from '@/modules/auth/auth.module';
import { AppLogger } from '@/common/logger/app-logger';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationRepository,
    NotificationsService,
    NotificationsAuthService,
    NotificationsListenerService,
    NotificationsGateway,
    CompanyMemberRepository,
    AppLogger,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
