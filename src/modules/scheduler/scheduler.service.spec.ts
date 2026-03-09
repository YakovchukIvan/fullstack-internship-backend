import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { QuizAttemptRepository } from '@/modules/companies/quizzes/repositories/quiz-attempt.repository';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { AppLogger } from '@/common/logger/app-logger';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { NotificationType } from '@/modules/notifications/enums/notification-type.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { CreateNotificationParams } from '@/modules/notifications/interfaces/create-notifications.interface';

// === Factory functions ===

const makeAttempt = (overrides: Partial<QuizAttempt> = {}): QuizAttempt =>
  ({
    id: 'attempt-uuid-1',
    userId: 'user-uuid-1',
    quizId: 'quiz-uuid-1',
    companyId: 'company-uuid-1',
    totalPoints: 2,
    maxPossiblePoints: 2,
    durationSeconds: 120,
    completedAt: new Date('2024-01-01T10:00:00Z'),
    quiz: {
      id: 'quiz-uuid-1',
      title: 'Test Quiz',
      frequencyInDays: 7,
      companyId: 'company-uuid-1',
      createdByUserId: 'user-uuid-1',
      isAiGenerated: false,
      aiPrompt: null,
      aiMetadata: null,
      createdBySnapshot: { displayName: 'Ivan Test', role: CompanyRole.OWNER },
    } as Quiz,
    company: {
      id: 'company-uuid-1',
      name: 'Test Company',
      slug: 'test-company',
    } as Company,
    ...overrides,
  }) as QuizAttempt;

// === Tests ===

describe('SchedulerService', () => {
  let service: SchedulerService;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let quizAttemptRepository: jest.Mocked<QuizAttemptRepository>;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: NotificationRepository,
          useValue: {
            deleteOldRead: jest.fn(),
          },
        },
        {
          provide: QuizAttemptRepository,
          useValue: {
            findAttemptsAvailableOn: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createMany: jest.fn(),
          },
        },
        {
          provide: AppLogger,
          useValue: {
            setLoggerContext: jest.fn(),
            log: jest.fn(),
            logError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    notificationRepository = module.get(NotificationRepository);
    quizAttemptRepository = module.get(QuizAttemptRepository);
    notificationsService = module.get(NotificationsService);
  });

  // === cleanupOldNotifications ===

  describe('cleanupOldNotifications (via handleDailyJobs)', () => {
    it('should call deleteOldRead with date approximately 30 days ago', async () => {
      const beforeCall = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      notificationRepository.deleteOldRead.mockResolvedValue(undefined);
      quizAttemptRepository.findAttemptsAvailableOn.mockResolvedValue([]);

      await service.handleDailyJobs();

      expect(notificationRepository.deleteOldRead).toHaveBeenCalledTimes(1);

      // Extract typed argument from mock call to avoid unsafe any assignment
      const [calledWithDate] = notificationRepository.deleteOldRead.mock.calls[0] as [Date];

      // Allow 5 second delta to account for test execution time
      expect(calledWithDate.getTime()).toBeCloseTo(beforeCall - thirtyDaysMs, -4);
    });

    it('should not throw if deleteOldRead fails — error is caught internally', async () => {
      // Scheduler jobs are wrapped in try/catch — one failure must not stop others
      notificationRepository.deleteOldRead.mockRejectedValue(new Error('DB connection lost'));
      quizAttemptRepository.findAttemptsAvailableOn.mockResolvedValue([]);

      await expect(service.handleDailyJobs()).resolves.not.toThrow();
    });
  });

  // === notifyQuizAvailableToday ===

  describe('notifyQuizAvailableToday (via handleDailyJobs)', () => {
    it('should call createMany with QUIZ_AVAILABLE params for each attempt', async () => {
      const attempt = makeAttempt();

      notificationRepository.deleteOldRead.mockResolvedValue(undefined);
      // First call is for today, second for tomorrow
      quizAttemptRepository.findAttemptsAvailableOn.mockResolvedValueOnce([attempt]).mockResolvedValueOnce([]);

      notificationsService.createMany.mockResolvedValue([]);

      await service.handleDailyJobs();

      // Extract typed params from first createMany call
      const [todayParams] = notificationsService.createMany.mock.calls[0] as [CreateNotificationParams[]];
      const param = todayParams[0];

      expect(param.userId).toBe(attempt.userId);
      expect(param.type).toBe(NotificationType.QUIZ_AVAILABLE);
      expect(param.companyId).toBe(attempt.companyId);
      expect(param.quizId).toBe(attempt.quizId);
      // Text must reference quiz title and company name
      expect(param.text).toContain(attempt.quiz.title);
      expect(param.text).toContain(attempt.company.name);
    });

    it('should not call createMany if no attempts available today', async () => {
      notificationRepository.deleteOldRead.mockResolvedValue(undefined);
      // No attempts for today or tomorrow
      quizAttemptRepository.findAttemptsAvailableOn.mockResolvedValue([]);

      await service.handleDailyJobs();

      expect(notificationsService.createMany).not.toHaveBeenCalled();
    });
  });

  // === notifyQuizAvailableTomorrow ===

  describe('notifyQuizAvailableTomorrow (via handleDailyJobs)', () => {
    it('should call createMany with QUIZ_AVAILABLE_TOMORROW params including time string', async () => {
      // completedAt set so that completedAt + frequencyInDays = tomorrow
      const completedAt = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      const attempt = makeAttempt({ completedAt });

      notificationRepository.deleteOldRead.mockResolvedValue(undefined);
      // First call today returns empty, second call tomorrow returns attempt
      quizAttemptRepository.findAttemptsAvailableOn.mockResolvedValueOnce([]).mockResolvedValueOnce([attempt]);

      notificationsService.createMany.mockResolvedValue([]);

      await service.handleDailyJobs();

      // Extract typed params from first createMany call
      const [tomorrowParams] = notificationsService.createMany.mock.calls[0] as [CreateNotificationParams[]];
      const param = tomorrowParams[0];

      expect(param.userId).toBe(attempt.userId);
      expect(param.type).toBe(NotificationType.QUIZ_AVAILABLE_TOMORROW);
      expect(param.companyId).toBe(attempt.companyId);
      expect(param.quizId).toBe(attempt.quizId);
      // Text must contain a time string in HH:MM format
      expect(param.text).toMatch(/\d{2}:\d{2}/);
    });
  });
});
