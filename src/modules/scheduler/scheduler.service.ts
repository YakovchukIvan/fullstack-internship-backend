import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { QuizAttemptRepository } from '@/modules/companies/quizzes/repositories/quiz-attempt.repository';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { AppLogger } from '@/common/logger/app-logger';
import { NotificationType } from '@/modules/notifications/enums/notification-type.enum';
import { NotificationMessages } from '@/modules/notifications/constants/notification-messages.constant';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class SchedulerService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly quizAttemptRepository: QuizAttemptRepository,
    private readonly notificationsService: NotificationsService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(SchedulerService.name);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyJobs(): Promise<void> {
    this.logger.log('Running daily scheduler jobs');
    await Promise.all([
      this.cleanupOldNotifications(),
      this.notifyQuizAvailableToday(),
      this.notifyQuizAvailableTomorrow(),
    ]);
  }

  private async cleanupOldNotifications(): Promise<void> {
    try {
      const olderThan = new Date(Date.now() - THIRTY_DAYS_MS);
      await this.notificationRepository.deleteOldRead(olderThan);
      this.logger.log('Cleanup old notifications done');
    } catch (err: unknown) {
      this.logger.logError('Failed to cleanup old notifications', err);
    }
  }

  private async notifyQuizAvailableToday(): Promise<void> {
    try {
      const attempts = await this.quizAttemptRepository.findAttemptsAvailableOn(new Date());

      const params = attempts.map((attempt) => ({
        userId: attempt.userId,
        type: NotificationType.QUIZ_AVAILABLE,
        text: NotificationMessages.quizAvailable(attempt.quiz.title, attempt.company.name),
        companyId: attempt.companyId,
        quizId: attempt.quizId,
      }));

      if (params.length > 0) {
        await this.notificationsService.createMany(params);
        this.logger.log(`Sent ${params.length} quiz available notifications`);
      }
    } catch (err: unknown) {
      this.logger.logError('Failed to notify quiz available today', err);
    }
  }

  private async notifyQuizAvailableTomorrow(): Promise<void> {
    try {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const attempts = await this.quizAttemptRepository.findAttemptsAvailableOn(tomorrow);

      const params = attempts.map((attempt) => {
        const availableAt = new Date(
          attempt.completedAt.getTime() + attempt.quiz.frequencyInDays * 24 * 60 * 60 * 1000,
        );
        const timeString = availableAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        return {
          userId: attempt.userId,
          type: NotificationType.QUIZ_AVAILABLE_TOMORROW,
          text: NotificationMessages.quizAvailableTomorrow(attempt.quiz.title, attempt.company.name, timeString),
          companyId: attempt.companyId,
          quizId: attempt.quizId,
        };
      });

      if (params.length > 0) {
        await this.notificationsService.createMany(params);
        this.logger.log(`Sent ${params.length} quiz available tomorrow notifications`);
      }
    } catch (err: unknown) {
      this.logger.logError('Failed to notify quiz available tomorrow', err);
    }
  }
}
