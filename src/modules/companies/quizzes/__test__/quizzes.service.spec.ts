import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuizRepository } from '../repositories/quiz.repository';
import { CompanyMemberRepository } from '../../repositories/company-member.repository';
import { CompaniesService } from '../../services/companies.service';
import { RedisService } from '@/modules/redis/redis.service';
import { AppLogger } from '@/common/logger/app-logger';
import { Quiz } from '../entities/quiz.entity';
import { Company } from '../../entities/company.entity';
import { CompanyMember } from '../../entities/company-member.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { CreateQuizDto } from '../dto/req/quiz/create-quiz.req.dto';
import { QuizzesService } from '../services/quizzes.service';
import { AiRateLimitService } from '../services/ai-rate-limit.service';
import { AiQuizGeneratorService } from '../services/ai-quiz-generator.service';

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
    description: 'Test description',
    frequencyInDays: 7,
    timeLimitMinutes: 30,
    companyId: 'company-uuid-1',
    createdByUserId: 'user-uuid-1',
    isAiGenerated: false,
    aiPrompt: null,
    aiMetadata: null,
    questions: [
      {
        question: 'Question 1',
        options: ['A', 'B'],
        correctOptionIndexes: [0],
      },
      {
        question: 'Question 2',
        options: ['A', 'B'],
        correctOptionIndexes: [1],
      },
    ],
    createdBySnapshot: { displayName: 'Ivan Test', role: CompanyRole.OWNER },
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }) as Quiz;

const makeCreateQuizDto = (overrides: Partial<CreateQuizDto> = {}): CreateQuizDto => ({
  title: 'Test Quiz',
  description: 'Test description',
  frequencyInDays: 7,
  timeLimitMinutes: 30,
  questions: [
    { question: 'Q1', options: ['A', 'B'], correctOptionIndexes: [0] },
    { question: 'Q2', options: ['A', 'B'], correctOptionIndexes: [1] },
  ],
  ...overrides,
});

const makeMember = (overrides: Partial<CompanyMember> = {}): CompanyMember =>
  ({
    id: 'member-uuid-1',
    userId: 'user-uuid-1',
    companyId: 'company-uuid-1',
    role: CompanyRole.OWNER,
    user: { firstName: 'Ivan', lastName: 'Test' },
    ...overrides,
  }) as CompanyMember;

// === Tests ===

describe('QuizzesService', () => {
  let service: QuizzesService;
  let quizRepository: jest.Mocked<QuizRepository>;
  let companyMemberRepository: jest.Mocked<CompanyMemberRepository>;
  let companiesService: jest.Mocked<CompaniesService>;
  let redisService: jest.Mocked<RedisService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        {
          provide: QuizRepository,
          useValue: {
            findOneInCompanyOrFail: jest.fn(),
            findPaginatedByCompany: jest.fn(),
            findPaginatedByCreator: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CompanyMemberRepository,
          useValue: {
            findMemberWithUserOrFail: jest.fn(),
          },
        },
        {
          provide: CompaniesService,
          useValue: {
            findBySlug: jest.fn(),
          },
        },
        {
          provide: AiQuizGeneratorService,
          useValue: {
            generateQuiz: jest.fn(),
          },
        },
        {
          provide: AiRateLimitService,
          useValue: {
            checkAndIncrement: jest.fn(),
            getRemainingQuota: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
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

    service = module.get<QuizzesService>(QuizzesService);
    quizRepository = module.get(QuizRepository);
    companyMemberRepository = module.get(CompanyMemberRepository);
    companiesService = module.get(CompaniesService);
    redisService = module.get(RedisService);
    eventEmitter = module.get(EventEmitter2);
  });

  // === create ===

  describe('create', () => {
    it('should create quiz and emit QUIZ_CREATED event', async () => {
      const company = makeCompany();
      const quiz = makeQuiz();
      const member = makeMember();
      const dto = makeCreateQuizDto();

      companiesService.findBySlug.mockResolvedValue(company);
      companyMemberRepository.findMemberWithUserOrFail.mockResolvedValue(member);
      quizRepository.create.mockReturnValue(quiz);
      quizRepository.save.mockResolvedValue(quiz);
      // findOneInCompanyOrFail called after save to load full quiz with relations
      quizRepository.findOneInCompanyOrFail.mockResolvedValue(quiz);

      const result = await service.create('test-company', 'user-uuid-1', dto);

      expect(result.title).toBe(quiz.title);
      // QUIZ_CREATED event must be emitted so members get notified
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'quiz.created',
        expect.objectContaining({ quizId: quiz.id, companyId: company.id }),
      );
    });
  });

  // === remove ===

  describe('remove', () => {
    it('should call quizRepository.remove with the found quiz', async () => {
      const company = makeCompany();
      const quiz = makeQuiz();

      companiesService.findBySlug.mockResolvedValue(company);
      quizRepository.findOneInCompanyOrFail.mockResolvedValue(quiz);
      quizRepository.remove.mockResolvedValue(quiz);

      await service.remove(quiz.id, 'test-company', 'user-uuid-1');

      // Ensure the correct quiz entity is passed to remove
      expect(quizRepository.remove).toHaveBeenCalledWith(quiz);
    });
  });

  // === findOne ===

  describe('findOne', () => {
    it('should save quiz start time to Redis', async () => {
      const company = makeCompany();
      const quiz = makeQuiz();

      companiesService.findBySlug.mockResolvedValue(company);
      quizRepository.findOneInCompanyOrFail.mockResolvedValue(quiz);
      redisService.set.mockResolvedValue(undefined);

      await service.findOne(quiz.id, 'test-company', 'user-uuid-1');

      // Timer start must be stored in Redis to enforce time limit on submit
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('user-uuid-1'),
        expect.any(String),
        quiz.timeLimitMinutes * 60,
      );
    });
  });
});
