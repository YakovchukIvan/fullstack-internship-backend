import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { LeaderboardEntryDto } from '../dto/res/leaderboard.res.dto';
import { UserRatingResponseDto } from '../dto/res/user-rating.res.dto';
import { toLeaderboardEntryDto } from '../mappers/leaderboard.mapper';
import { LeaderboardRawRow } from '@/modules/analytics/interfaces/analytics.interfaces';
import { calculateRating } from '../helper/quiz-math.helper';

@Injectable()
export class QuizAttemptRepository extends Repository<QuizAttempt> {
  constructor(dataSource: DataSource) {
    super(QuizAttempt, dataSource.createEntityManager());
  }

  async assertFrequencyNotExceeded(userId: string, quizId: string, frequencyInDays: number): Promise<void> {
    const lastAttempt = await this.findOne({
      where: { userId, quizId },
      order: { completedAt: 'DESC' },
    });

    if (!lastAttempt) {
      return;
    }

    const diffDays = (Date.now() - lastAttempt.completedAt.getTime()) / (1000 * 60 * 60 * 24);
    GuardAssertions.isTrueBadRequest(
      diffDays >= frequencyInDays,
      `You can retake this quiz in ${Math.ceil(frequencyInDays - diffDays)} day(s)`,
    );
  }

  async getLeaderboardByCompany(companyId: string): Promise<LeaderboardEntryDto[]> {
    const rows = await this.createQueryBuilder('attempt')
      .select('attempt.user_id', 'userId')
      .addSelect('SUM(attempt.total_points)', 'sumPoints')
      .addSelect('SUM(attempt.max_possible_points)', 'sumMaxPoints')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .addSelect('user.first_name', 'firstName')
      .addSelect('user.last_name', 'lastName')
      .addSelect('user.avatar_url', 'avatarUrl')
      .innerJoin('attempt.user', 'user')
      .where('attempt.company_id = :companyId', { companyId })
      .groupBy('attempt.user_id')
      .addGroupBy('user.first_name')
      .addGroupBy('user.last_name')
      .addGroupBy('user.avatar_url')
      .orderBy('SUM(attempt.total_points) / SUM(attempt.max_possible_points)', 'DESC')
      .getRawMany<LeaderboardRawRow>();

    return rows.map((row, index) => toLeaderboardEntryDto(row, index + 1));
  }

  async getUserRatingStats(userId: string): Promise<UserRatingResponseDto> {
    const result = await this.createQueryBuilder('attempt')
      .select('SUM(attempt.total_points)', 'sumPoints')
      .addSelect('SUM(attempt.max_possible_points)', 'sumMaxPoints')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .where('attempt.user_id = :userId', { userId })
      .getRawOne<{ sumPoints: string | null; sumMaxPoints: string | null; totalAttempts: string }>();

    const totalPoints = Number(result?.sumPoints ?? 0);
    const totalMaxPoints = Number(result?.sumMaxPoints ?? 0);
    const totalAttempts = Number(result?.totalAttempts ?? 0);
    const rating = calculateRating(totalPoints, totalMaxPoints);

    return {
      rating,
      ratingPercent: Number((rating * 100).toFixed(2)),
      totalAttempts,
      totalPoints,
      totalMaxPoints,
    };
  }
}
