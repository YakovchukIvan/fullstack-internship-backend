import { Injectable } from '@nestjs/common';
import { Quiz } from '../entities/quiz.entity';
import { CompaniesService } from '../../services/companies.service';
import { SubmitQuizDto } from '../dto/req/submit-quiz.req.dto';
import { QuizAttemptResponseDto } from '../dto/res/quiz-attempt.res.dto';
import { CompanyLeaderboardResponseDto } from '../dto/res/leaderboard.res.dto';
import { UserRatingResponseDto } from '../dto/res/user-rating.res.dto';
import { toAttemptCreatePayload, toQuizAttemptResponseDto } from '../mappers/quiz-attempt.mapper';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { AppLogger } from '@/common/logger/app-logger';
import { BuildSnapshotParams, QuizAttemptAnswer } from '../interfaces/quiz-attempt.interfaces';
import { QuizRepository } from '../repositories/quiz.repository';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository';
import { CompanyMemberRepository } from '../../repositories/company-member.repository';
import { QuizAnswerRedisRepository } from '../repositories/quiz-answer-redis.repository';
import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';
import { toAnswerRecord, toAnswerSnapshot, toQuizAttemptAnswer } from '../mappers/quiz-snapshot.mapper';

@Injectable()
export class QuizAttemptsService {
  constructor(
    private readonly attemptRepository: QuizAttemptRepository,
    private readonly quizRepository: QuizRepository,
    private readonly companyMemberRepository: CompanyMemberRepository,
    private readonly companiesService: CompaniesService,
    private readonly quizAnswerRedisRepository: QuizAnswerRedisRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(QuizAttemptsService.name);
  }

  async submit(slug: string, quizId: string, userId: string, dto: SubmitQuizDto): Promise<QuizAttemptResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);
    const quiz = await this.quizRepository.findOneInCompanyOrFail(quizId, company.id);

    await this.attemptRepository.assertFrequencyNotExceeded(userId, quizId, quiz.frequencyInDays);

    GuardAssertions.isTrueBadRequest(
      dto.answers.length === quiz.questions.length,
      `Expected ${quiz.questions.length} answers, got ${dto.answers.length}`,
    );

    const answers = this.calculateAnswers(quiz, dto);
    const totalPoints = Number(answers.reduce((sum, a) => sum + a.questionScore, 0).toFixed(4));
    const completedAt = new Date();

    const attempt = this.attemptRepository.create(
      toAttemptCreatePayload(
        userId,
        quizId,
        company.id,
        totalPoints,
        quiz.questions.length,
        completedAt,
        dto.durationSeconds,
      ),
    );

    const saved = await this.attemptRepository.save(attempt);
    this.logger.log(`Quiz attempt saved: ${saved.id} for user ${userId}`);

    const snapshot = this.buildSnapshot({
      attemptId: saved.id,
      userId,
      companyId: company.id,
      quiz,
      answers,
      totalPoints,
      completedAt,
    });

    try {
      await this.quizAnswerRedisRepository.saveAnswers(snapshot);
      this.logger.log(`Quiz answers cached in Redis: attempt ${saved.id}`);
    } catch (err: unknown) {
      this.logger.logError(`Failed to cache quiz answers for attempt ${saved.id}`, err);
    }

    return toQuizAttemptResponseDto(saved);
  }

  async getCompanyLeaderboard(slug: string, userId: string): Promise<CompanyLeaderboardResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);

    const [leaderboard, totalMembers] = await Promise.all([
      this.attemptRepository.getLeaderboardByCompany(company.id),
      this.companyMemberRepository.count({ where: { companyId: company.id } }),
    ]);

    return { leaderboard, totalMembers };
  }

  async getUserRating(userId: string): Promise<UserRatingResponseDto> {
    return this.attemptRepository.getUserRatingStats(userId);
  }

  private buildSnapshot(params: BuildSnapshotParams): QuizAnswerSnapshot {
    const answerRecords = params.answers.map((answer) =>
      toAnswerRecord(answer, params.quiz.questions[answer.questionIndex]),
    );
    return toAnswerSnapshot(params, answerRecords);
  }

  private calculateAnswers(quiz: Quiz, dto: SubmitQuizDto): QuizAttemptAnswer[] {
    return quiz.questions.map((question, index) =>
      toQuizAttemptAnswer(index, dto.answers[index]?.selectedAnswers ?? [], question.correctAnswers),
    );
  }
}
