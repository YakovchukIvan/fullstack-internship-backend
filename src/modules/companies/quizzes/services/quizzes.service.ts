import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, QuizQuestion } from '../entities/quiz.entity';
import { CreateQuizDto, QuizQuestionDto } from '../dto/req/create-quiz.req.dto';
import { UpdateQuizDto } from '../dto/req/update-quiz.req.dto';
import { GenerateQuizAiDto } from '../dto/req/generate-quiz-ai.req.dto';
import { QuizzesPaginationDto } from '../dto/req/quizzes-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompaniesService } from '../../services/companies.service';
import { AiQuizGeneratorService } from './ai-quiz-generator.service';
import { AppLogger } from '@/common/logger/app-logger';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizzesRepository: Repository<Quiz>,
    private readonly companiesService: CompaniesService,
    private readonly aiGenerator: AiQuizGeneratorService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(QuizzesService.name);
  }

  async create(slug: string, userId: string, dto: CreateQuizDto): Promise<Quiz> {
    const company = await this.companiesService.findBySlug(slug, userId);
    this.validateQuestions(dto.questions);

    const quiz = this.quizzesRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      frequencyInDays: dto.frequencyInDays,
      questions: this.mapToQuizQuestions(dto.questions),
      companyId: company.id,
      isAiGenerated: false,
      aiPrompt: null,
      aiMetadata: null,
    });

    const saved = await this.quizzesRepository.save(quiz);
    this.logger.log(`Quiz created: ${saved.id} - "${saved.title}"`, QuizzesService.name);

    return saved;
  }

  async generateWithAi(slug: string, userId: string, dto: GenerateQuizAiDto): Promise<Quiz> {
    const company = await this.companiesService.findBySlug(slug, userId);

    this.logger.log(`Generating AI quiz for company ${company.id}: ${dto.topic}`, QuizzesService.name);

    const aiQuiz = await this.aiGenerator.generateQuiz(dto);

    const quiz = this.quizzesRepository.create({
      title: aiQuiz.title,
      description: aiQuiz.description,
      frequencyInDays: dto.frequencyInDays,
      questions: aiQuiz.questions,
      companyId: company.id,
      isAiGenerated: true,
      aiPrompt: `${dto.topic} (${dto.difficulty})`,
      aiMetadata: {
        model: aiQuiz.model,
        generatedAt: new Date(),
        difficulty: dto.difficulty,
      },
    });

    const saved = await this.quizzesRepository.save(quiz);
    this.logger.log(`AI quiz generated and saved: ${saved.id} - "${saved.title}"`, QuizzesService.name);

    return saved;
  }

  async findAll(slug: string, userId: string, dto: QuizzesPaginationDto): Promise<PaginatedResultResponseDto<Quiz>> {
    const company = await this.companiesService.findBySlug(slug, userId);

    return createPaginatedResult(this.quizzesRepository, dto, {
      where: { companyId: company.id },
    });
  }

  async findOne(id: string, slug: string, userId: string): Promise<Quiz> {
    const company = await this.companiesService.findBySlug(slug, userId);

    const quiz = await this.quizzesRepository.findOne({
      where: { id, companyId: company.id },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found in this company`);
    }

    return quiz;
  }

  async update(id: string, slug: string, userId: string, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id, slug, userId);

    if (dto.questions !== undefined) {
      this.validateQuestions(dto.questions);
      quiz.questions = this.mapToQuizQuestions(dto.questions);
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

    const updated = await this.quizzesRepository.save(quiz);
    this.logger.log(`Quiz updated: ${updated.id} by user ${userId}`, QuizzesService.name);

    return updated;
  }

  async remove(id: string, slug: string, userId: string): Promise<void> {
    const quiz = await this.findOne(id, slug, userId);

    await this.quizzesRepository.remove(quiz);
    this.logger.log(`Quiz deleted: ${id} by user ${userId}`, QuizzesService.name);
  }

  private mapToQuizQuestions(questions: QuizQuestionDto[]): QuizQuestion[] {
    return questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswers: q.correctAnswers,
      isMultiSelect: q.isMultiSelect ?? false,
    }));
  }

  private validateQuestions(questions: QuizQuestionDto[]): void {
    questions.forEach((q, index) => {
      q.correctAnswers.forEach((idx) => {
        if (idx < 0 || idx >= q.options.length) {
          throw new BadRequestException(
            `Question ${index + 1}: correctAnswer index ${idx} is out of range (0-${q.options.length - 1})`,
          );
        }
      });

      const isMultiSelect = q.isMultiSelect ?? false;

      if (!isMultiSelect && q.correctAnswers.length !== 1) {
        throw new BadRequestException(
          `Question ${index + 1}: Single-select question must have exactly 1 correct answer`,
        );
      }

      if (isMultiSelect && q.correctAnswers.length < 2) {
        throw new BadRequestException(
          `Question ${index + 1}: Multi-select question must have at least 2 correct answers`,
        );
      }
    });
  }
}
