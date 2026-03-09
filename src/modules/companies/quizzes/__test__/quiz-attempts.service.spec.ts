import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository';
import { QuizRepository } from '../repositories/quiz.repository';
import { CompaniesService } from '../../services/companies.service';
import { QuizAnswerRedisRepository } from '../repositories/quiz-answer-redis.repository';
import { RedisService } from '@/modules/redis/redis.service';
import { AppLogger } from '@/common/logger/app-logger';
import { Quiz } from '../entities/quiz.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { Company } from '../../entities/company.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { SubmitQuizDto } from '../dto/req/attempt/submit-quiz.req.dto';
import { QuizAttemptsService } from '../services/quiz-attempts.service';

// === Factory functions ===

const makeCompany = (overrides: Partial<Company> = {}): Company =>
  ({
    id: 'company-uuid-1',
    name: 'Test Company',
    slug: 'test-company',
    ownerId: 'user-uuid-1',
    isVisible: true,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }) as Company;

const makeQuiz = (overrides: Partial<Quiz> = {}): Quiz =>
  ({
    id: 'quiz-uuid-1',
    title: 'Test Quiz',
    description: null,
    frequencyInDays: 7,
    timeLimitMinutes: 30,
    companyId: 'company-uuid-1',
    createdByUserId: 'user-uuid-1',
    isAiGenerated: false,
    aiPrompt: null,
    aiMetadata: null,
    questions: [
      { question: 'Q1', options: ['A', 'B'], correctOptionIndexes: [0] },
      { question: 'Q2', options: ['A', 'B'], correctOptionIndexes: [1] },
    ],
    createdBySnapshot: { displayName: 'Ivan Test', role: CompanyRole.OWNER },
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }) as Quiz;

const makeAttempt = (overrides: Partial<QuizAttempt> = {}): QuizAttempt =>
  ({
    id: 'attempt-uuid-1',
    userId: 'user-uuid-1',
    quizId: 'quiz-uuid-1',
    companyId: 'company-uuid-1',
    totalPoints: 2,
    maxPossiblePoints: 2,
    durationSeconds: 120,
    completedAt: new Date('2024-01-01'),
    ...overrides,
  }) as QuizAttempt;

const makeSubmitDto = (overrides: Partial<SubmitQuizDto> = {}): SubmitQuizDto => ({
  answers: [{ selectedOptionIndexes: [0] }, { selectedOptionIndexes: [1] }],
  ...overrides,
});

// === Tests ===

describe('QuizAttemptsService', () => {
  let service: QuizAttemptsService;
  let attemptRepository: jest.Mocked<QuizAttemptRepository>;
  let quizRepository: jest.Mocked<QuizRepository>;
  let companiesService: jest.Mocked<CompaniesService>;
  let quizAnswerRedisRepository: jest.Mocked<QuizAnswerRedisRepository>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAttemptsService,
        {
          provide: QuizAttemptRepository,
          useValue: {
            assertFrequencyNotExceeded: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            getUserRatingStats: jest.fn(),
          },
        },
        {
          provide: QuizRepository,
          useValue: {
            findOneInCompanyOrFail: jest.fn(),
          },
        },
        {
          provide: CompaniesService,
          useValue: {
            findBySlug: jest.fn(),
          },
        },
        {
          provide: QuizAnswerRedisRepository,
          useValue: {
            saveAnswers: jest.fn(),
            getUserAnswersForQuiz: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            del: jest.fn(),
            set: jest.fn(),
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

    service = module.get<QuizAttemptsService>(QuizAttemptsService);
    attemptRepository = module.get(QuizAttemptRepository);
    quizRepository = module.get(QuizRepository);
    companiesService = module.get(CompaniesService);
    quizAnswerRedisRepository = module.get(QuizAnswerRedisRepository);
    redisService = module.get(RedisService);
  });

  // === submit ===

  describe('submit', () => {
    it('should submit quiz successfully; throw BadRequestException if answer count mismatches or frequency exceeded', async () => {
      const company = makeCompany();
      const quiz = makeQuiz();
      const attempt = makeAttempt();
      const userId = 'user-uuid-1';

      // === Success case ===

      companiesService.findBySlug.mockResolvedValue(company);
      quizRepository.findOneInCompanyOrFail.mockResolvedValue(quiz);
      attemptRepository.assertFrequencyNotExceeded.mockResolvedValue(undefined);
      // Redis stores quiz start time — needed to calculate durationSeconds
      redisService.get.mockResolvedValue(String(Date.now() - 60_000));
      redisService.del.mockResolvedValue(undefined);
      attemptRepository.create.mockReturnValue(attempt);
      attemptRepository.save.mockResolvedValue(attempt);
      quizAnswerRedisRepository.saveAnswers.mockResolvedValue(undefined);

      const dto = makeSubmitDto();
      const result = await service.submit('test-company', quiz.id, userId, dto);

      expect(result.id).toBe(attempt.id);
      expect(result.totalPoints).toBe(attempt.totalPoints);

      // === Answer count does not match question count ===

      companiesService.findBySlug.mockResolvedValue(company);
      quizRepository.findOneInCompanyOrFail.mockResolvedValue(quiz);
      attemptRepository.assertFrequencyNotExceeded.mockResolvedValue(undefined);
      redisService.get.mockResolvedValue(String(Date.now() - 60_000));

      // Only 1 answer provided but quiz has 2 questions — must throw BadRequestException
      const wrongDto = makeSubmitDto({ answers: [{ selectedOptionIndexes: [0] }] });

      await expect(service.submit('test-company', quiz.id, userId, wrongDto)).rejects.toThrow(BadRequestException);

      // === Frequency not exceeded ===

      companiesService.findBySlug.mockResolvedValue(company);
      quizRepository.findOneInCompanyOrFail.mockResolvedValue(quiz);
      // assertFrequencyNotExceeded throws BadRequestException when retake is too early
      attemptRepository.assertFrequencyNotExceeded.mockRejectedValue(
        new BadRequestException('You can retake this quiz in 5 day(s)'),
      );

      await expect(service.submit('test-company', quiz.id, userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should save attempt even if Redis cache fails', async () => {
      const company = makeCompany();
      const quiz = makeQuiz();
      const attempt = makeAttempt();
      const userId = 'user-uuid-1';

      companiesService.findBySlug.mockResolvedValue(company);
      quizRepository.findOneInCompanyOrFail.mockResolvedValue(quiz);
      attemptRepository.assertFrequencyNotExceeded.mockResolvedValue(undefined);
      redisService.get.mockResolvedValue(String(Date.now() - 60_000));
      redisService.del.mockResolvedValue(undefined);
      attemptRepository.create.mockReturnValue(attempt);
      attemptRepository.save.mockResolvedValue(attempt);
      // Redis cache write fails — must not affect main flow (wrapped in try/catch)
      quizAnswerRedisRepository.saveAnswers.mockRejectedValue(new Error('Redis connection lost'));

      const dto = makeSubmitDto();
      const result = await service.submit('test-company', quiz.id, userId, dto);

      // Attempt must still be returned despite Redis failure
      expect(result.id).toBe(attempt.id);
    });
  });
});
