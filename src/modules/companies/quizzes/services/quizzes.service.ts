import { Injectable } from '@nestjs/common';
import { Quiz } from '../entities/quiz.entity';
import { CreateQuizDto } from '../dto/req/create-quiz.req.dto';
import { UpdateQuizDto } from '../dto/req/update-quiz.req.dto';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { QuizzesPaginationDto } from '../dto/req/quizzes-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompaniesService } from '../../services/companies.service';
import { AiQuizGeneratorService } from './ai-quiz-generator.service';
import { AiRateLimitService } from './ai-rate-limit.service';
import { AppLogger } from '@/common/logger/app-logger';
import { validateQuizQuestions } from '../helpers/quiz-questions.helper';
import { mapToQuizQuestions } from '../mappers/quiz-questions.mapper';
import { UserRole } from '@/common/enums/user-role.enum';
import { QuizRepository } from '../repositories/quiz.repository';
import { CompanyMemberRepository } from '../../repositories/company-member.repository';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly companyMemberRepository: CompanyMemberRepository,
    private readonly companiesService: CompaniesService,
    private readonly aiGenerator: AiQuizGeneratorService,
    private readonly aiRateLimitService: AiRateLimitService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(QuizzesService.name);
  }

  async create(slug: string, userId: string, dto: CreateQuizDto): Promise<Quiz> {
    const company = await this.companiesService.findBySlug(slug, userId);
    validateQuizQuestions(dto.questions);

    const { createdByUserId, snapshot } = await this.buildCreatedBySnapshot(company.id, userId);

    const quiz = this.quizRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      frequencyInDays: dto.frequencyInDays,
      questions: mapToQuizQuestions(dto.questions),
      companyId: company.id,
      createdByUserId,
      createdBySnapshot: snapshot,
      isAiGenerated: false,
      aiPrompt: null,
      aiMetadata: null,
    });

    const saved = await this.quizRepository.save(quiz);
    this.logger.log(`Quiz created: ${saved.id} - "${saved.title}"`);
    return this.quizRepository.findOneInCompanyOrFail(saved.id, company.id);
  }

  async generateWithAi(
    slug: string,
    userId: string,
    dto: GenerateQuizAiDto,
    userRole?: UserRole,
  ): Promise<{ quiz: Quiz; remaining: number }> {
    const company = await this.companiesService.findBySlug(slug, userId, userRole);
    const { remaining } = await this.aiRateLimitService.checkAndIncrement(company.id);

    const [aiQuiz, { createdByUserId, snapshot }] = await Promise.all([
      this.aiGenerator.generateQuiz(dto),
      this.buildCreatedBySnapshot(company.id, userId),
    ]);

    const quiz = this.quizRepository.create({
      title: aiQuiz.title,
      description: aiQuiz.description,
      frequencyInDays: dto.frequencyInDays,
      questions: aiQuiz.questions,
      companyId: company.id,
      createdByUserId,
      createdBySnapshot: snapshot,
      isAiGenerated: true,
      aiPrompt: `${dto.topic} (${dto.difficulty})`,
      aiMetadata: { model: aiQuiz.model, generatedAt: new Date(), difficulty: dto.difficulty },
    });

    const saved = await this.quizRepository.save(quiz);
    this.logger.log(`AI quiz generated: ${saved.id} - "${saved.title}"`);

    return {
      quiz: await this.quizRepository.findOneInCompanyOrFail(saved.id, company.id),
      remaining,
    };
  }

  async findAll(slug: string, userId: string, dto: QuizzesPaginationDto): Promise<PaginatedResultResponseDto<Quiz>> {
    const company = await this.companiesService.findBySlug(slug, userId);
    return this.quizRepository.findPaginatedByCompany(company.id, dto);
  }

  async findAllByUser(
    userId: string,
    dto: QuizzesPaginationDto,
    companySlug?: string,
  ): Promise<PaginatedResultResponseDto<Quiz>> {
    let companyId: string | undefined;
    if (companySlug) {
      const company = await this.companiesService.findBySlug(companySlug, userId);
      companyId = company.id;
    }
    return this.quizRepository.findPaginatedByUser(userId, dto, companyId);
  }

  async findOne(id: string, slug: string, userId: string): Promise<Quiz> {
    const company = await this.companiesService.findBySlug(slug, userId);
    return this.quizRepository.findOneInCompanyOrFail(id, company.id);
  }

  async update(id: string, slug: string, userId: string, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id, slug, userId);

    if (dto.questions !== undefined) {
      validateQuizQuestions(dto.questions);
      quiz.questions = mapToQuizQuestions(dto.questions);
    }
    if (dto.title !== undefined) {
      quiz.title = dto.title;
    }
    if (dto.description !== undefined) {
      quiz.description = dto.description ?? null;
    }
    if (dto.frequencyInDays !== undefined) {
      quiz.frequencyInDays = dto.frequencyInDays;
    }

    const updated = await this.quizRepository.save(quiz);
    this.logger.log(`Quiz updated: ${updated.id} by user ${userId}`);
    return updated;
  }

  async remove(id: string, slug: string, userId: string): Promise<void> {
    const quiz = await this.findOne(id, slug, userId);
    await this.quizRepository.remove(quiz);
    this.logger.log(`Quiz deleted: ${id} by user ${userId}`);
  }

  async getAiQuota(slug: string, userId: string, userRole?: UserRole) {
    const company = await this.companiesService.findBySlug(slug, userId, userRole);
    return this.aiRateLimitService.getRemainingQuota(company.id);
  }

  private async buildCreatedBySnapshot(companyId: string, userId: string) {
    const member = await this.companyMemberRepository.findMemberWithUserOrFail(companyId, userId);
    return {
      createdByUserId: member.userId,
      snapshot: {
        displayName: `${member.user.firstName} ${member.user.lastName}`.trim(),
        role: member.role,
      },
    };
  }
}
