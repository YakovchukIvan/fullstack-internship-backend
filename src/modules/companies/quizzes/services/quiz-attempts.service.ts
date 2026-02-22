import { Injectable } from '@nestjs/common';
import { Quiz } from '../entities/quiz.entity';
import { CompaniesService } from '../../services/companies.service';
import { SubmitQuizDto } from '../dto/req/submit-quiz.req.dto';
import { QuizAttemptResponseDto } from '../dto/res/quiz-attempt.res.dto';
import { CompanyLeaderboardResponseDto } from '../dto/res/leaderboard.res.dto';
import { UserRatingResponseDto } from '../dto/res/user-rating.res.dto';
import { toQuizAttemptResponseDto } from '../mappers/quiz-attempt.mapper';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { AppLogger } from '@/common/logger/app-logger';
import { QuizAttemptAnswer } from '../interfaces/quiz-attempt.interfaces';
import { QuizRepository } from '../repositories/quiz.repository';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository';
import { CompanyMemberRepository } from '../../repositories/company-member.repository';
import { QuizAnswerRedisRepository } from '../repositories/quiz-answer-redis.repository';
import { QuizAnswerSnapshot, QuizAnswerRecord } from '../interfaces/quiz-answer-snapshot.interface';

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

    const attempt = this.attemptRepository.create({
      userId,
      quizId,
      companyId: company.id,
      totalPoints,
      maxPossiblePoints: quiz.questions.length,
      durationSeconds: dto.durationSeconds ?? undefined,
      completedAt,
    });

    const saved = await this.attemptRepository.save(attempt);
    this.logger.log(`Quiz attempt saved: ${saved.id} for user ${userId}`);

    const snapshot = this.buildSnapshot(saved.id, userId, company.id, quiz, answers, totalPoints, completedAt);

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

  private buildSnapshot(
    attemptId: string,
    userId: string,
    companyId: string,
    quiz: Quiz,
    answers: QuizAttemptAnswer[],
    totalPoints: number,
    completedAt: Date,
  ): QuizAnswerSnapshot {
    const answerRecords: QuizAnswerRecord[] = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];

      return {
        questionIndex: answer.questionIndex,
        questionText: question.question,
        options: question.options,
        selectedAnswers: answer.selectedAnswers,
        correctAnswers: answer.correctAnswers,
        isCorrect: answer.questionScore === 1,
        questionScore: answer.questionScore,
      };
    });

    return {
      attemptId,
      userId,
      companyId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      completedAt: completedAt.toISOString(),
      totalPoints,
      maxPossiblePoints: quiz.questions.length,
      answers: answerRecords,
    };
  }

  private calculateAnswers(quiz: Quiz, dto: SubmitQuizDto): QuizAttemptAnswer[] {
    return quiz.questions.map((question, index) => {
      const selected = dto.answers[index]?.selectedAnswers ?? [];
      const correct = question.correctAnswers;
      const correctSelected = selected.filter((s) => correct.includes(s)).length;
      const incorrectSelected = selected.filter((s) => !correct.includes(s)).length;
      const questionScore = Math.max(0, (correctSelected - incorrectSelected) / correct.length);

      return {
        questionIndex: index,
        selectedAnswers: selected,
        correctAnswers: correct,
        questionScore: Number(questionScore.toFixed(4)),
      };
    });
  }
}
