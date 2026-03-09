import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { QuizAttemptRepository } from '@/modules/companies/quizzes/repositories/quiz-attempt.repository';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { AppLogger } from '@/common/logger/app-logger';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Notification, QuizAttempt]), NotificationsModule],
  providers: [SchedulerService, NotificationRepository, QuizAttemptRepository, AppLogger],
})
export class SchedulerModule {}
