import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { Quiz } from '../entities/quiz.entity';
import { CompanyMember } from '../../entities/company-member.entity';
import { CompaniesService } from '../../services/companies.service';
import { SubmitQuizDto } from '../dto/req/submit-quiz.req.dto';
import { QuizAttemptResponseDto } from '../dto/res/quiz-attempt.res.dto';
import { LeaderboardEntryDto, CompanyLeaderboardResponseDto } from '../dto/res/leaderboard.res.dto';
import { UserRatingResponseDto } from '../dto/res/user-rating.res.dto';
import { toQuizAttemptResponseDto } from '../mappers/quiz-attempt.mapper';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { AppLogger } from '@/common/logger/app-logger';
import { QuizAttemptAnswer } from '../interfaces/quiz-attempt.interfaces';

@Injectable()
export class QuizAttemptsService {
  constructor(
    @InjectRepository(QuizAttempt)
    private readonly attemptsRepository: Repository<QuizAttempt>,
    @InjectRepository(Quiz)
    private readonly quizzesRepository: Repository<Quiz>,
    @InjectRepository(CompanyMember)
    private readonly companyMembersRepository: Repository<CompanyMember>,
    private readonly companiesService: CompaniesService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(QuizAttemptsService.name);
  }

  async submit(slug: string, quizId: string, userId: string, dto: SubmitQuizDto): Promise<QuizAttemptResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);

    const quiz = await this.quizzesRepository.findOne({
      where: { id: quizId, companyId: company.id },
    });
    GuardAssertions.exists(quiz, `Quiz with ID ${quizId} not found in this company`);

    await this.assertFrequencyNotExceeded(userId, quizId, quiz.frequencyInDays);

    GuardAssertions.isTrueBadRequest(
      dto.answers.length === quiz.questions.length,
      `Expected ${quiz.questions.length} answers, got ${dto.answers.length}`,
    );

    const answers = this.calculateAnswers(quiz, dto);
    const totalPoints = answers.reduce((sum, a) => sum + a.questionScore, 0);
    const totalPointsRounded = Number(totalPoints.toFixed(4));

    const attempt = this.attemptsRepository.create({
      userId,
      quizId,
      companyId: company.id,
      totalPoints: totalPointsRounded,
      maxPossiblePoints: quiz.questions.length,
      answers,
      durationSeconds: dto.durationSeconds ?? undefined,
      completedAt: new Date(),
    });

    const saved = await this.attemptsRepository.save(attempt);
    this.logger.log(`Quiz attempt saved: ${saved.id} for user ${userId}`, QuizAttemptsService.name);

    return toQuizAttemptResponseDto(saved);
  }

  async getCompanyLeaderboard(slug: string, userId: string): Promise<CompanyLeaderboardResponseDto> {
    const company = await this.companiesService.findBySlug(slug, userId);

    const results = await this.attemptsRepository
      .createQueryBuilder('attempt')
      .select('attempt.user_id', 'userId')
      .addSelect('SUM(attempt.total_points)', 'sumPoints')
      .addSelect('SUM(attempt.max_possible_points)', 'sumMaxPoints')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .innerJoin('attempt.user', 'user')
      .addSelect('user.first_name', 'firstName')
      .addSelect('user.last_name', 'lastName')
      .addSelect('user.avatar_url', 'avatarUrl')
      .where('attempt.company_id = :companyId', { companyId: company.id })
      .groupBy('attempt.user_id')
      .addGroupBy('user.first_name')
      .addGroupBy('user.last_name')
      .addGroupBy('user.avatar_url')
      .orderBy('SUM(attempt.total_points) / SUM(attempt.max_possible_points)', 'DESC')
      .getRawMany<{
        userId: string;
        sumPoints: string;
        sumMaxPoints: string;
        totalAttempts: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
      }>();

    const totalMembers = await this.companyMembersRepository.count({
      where: { companyId: company.id },
    });

    const leaderboard: LeaderboardEntryDto[] = results.map((row, index) => ({
      userId: row.userId,
      displayName: `${row.firstName} ${row.lastName}`.trim(),
      avatarUrl: row.avatarUrl ?? null,
      rating: Number((Number(row.sumPoints) / Number(row.sumMaxPoints)).toFixed(4)),
      totalAttempts: Number(row.totalAttempts),
      rank: index + 1,
    }));

    return { leaderboard, totalMembers };
  }

  async getUserRating(userId: string): Promise<UserRatingResponseDto> {
    const result = await this.attemptsRepository
      .createQueryBuilder('attempt')
      .select('SUM(attempt.total_points)', 'sumPoints')
      .addSelect('SUM(attempt.max_possible_points)', 'sumMaxPoints')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .where('attempt.user_id = :userId', { userId })
      .getRawOne<{
        sumPoints: string | null;
        sumMaxPoints: string | null;
        totalAttempts: string;
      }>();

    const totalPoints = Number(result?.sumPoints ?? 0);
    const totalMaxPoints = Number(result?.sumMaxPoints ?? 0);
    const totalAttempts = Number(result?.totalAttempts ?? 0);
    const rating = totalMaxPoints > 0 ? Number((totalPoints / totalMaxPoints).toFixed(4)) : 0;

    return {
      rating,
      ratingPercent: Number((rating * 100).toFixed(2)),
      totalAttempts,
      totalPoints,
      totalMaxPoints,
    };
  }

  private async assertFrequencyNotExceeded(userId: string, quizId: string, frequencyInDays: number): Promise<void> {
    const lastAttempt = await this.attemptsRepository.findOne({
      where: { userId, quizId },
      order: { completedAt: 'DESC' },
    });

    if (!lastAttempt) {
      return;
    }

    const now = new Date();
    const diffMs = now.getTime() - lastAttempt.completedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    GuardAssertions.isTrueBadRequest(
      diffDays >= frequencyInDays,
      `You can retake this quiz in ${Math.ceil(frequencyInDays - diffDays)} day(s)`,
    );
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
