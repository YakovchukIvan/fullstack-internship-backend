import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import {
  DurationDynamicsRaw,
  DurationStatsRaw,
  LeaderboardRawRow,
  PerformanceRaw,
  ScoreDynamicsRow,
} from '../interfaces/analytics.interfaces';

@Injectable()
export class AnalyticsRepository extends Repository<QuizAttempt> {
  constructor(dataSource: DataSource) {
    super(QuizAttempt, dataSource.createEntityManager());
  }

  async getLeaderboardByCompany(companyId: string): Promise<LeaderboardRawRow[]> {
    return this.createQueryBuilder('attempt')
      .select('attempt.user_id', 'userId')
      .addSelect('SUM(attempt.total_points)', 'sumPoints')
      .addSelect('SUM(attempt.max_possible_points)', 'sumMaxPoints')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .addSelect('AVG(attempt.duration_seconds)', 'avgDuration')
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
  }

  async getUserScoreDynamics(userId: string, from?: Date, to?: Date, companyId?: string): Promise<ScoreDynamicsRow[]> {
    const qb = this.createQueryBuilder('attempt')
      .select("DATE_TRUNC('day', attempt.completed_at)", 'date')
      .addSelect(
        'ROUND(AVG(attempt.total_points::numeric / attempt.max_possible_points::numeric * 100), 2)',
        'avgAccuracy',
      )
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .where('attempt.user_id = :userId', { userId });

    if (companyId) {
      qb.andWhere('attempt.company_id = :companyId', { companyId });
    }
    if (from) {
      qb.andWhere('attempt.completed_at >= :from', { from });
    }
    if (to) {
      qb.andWhere('attempt.completed_at <= :to', { to });
    }

    return qb
      .groupBy("DATE_TRUNC('day', attempt.completed_at)")
      .orderBy("DATE_TRUNC('day', attempt.completed_at)", 'ASC')
      .getRawMany<ScoreDynamicsRow>();
  }

  async getCompanyScoreDynamics(companyId: string, from?: Date, to?: Date): Promise<ScoreDynamicsRow[]> {
    const qb = this.createQueryBuilder('attempt')
      .select("DATE_TRUNC('day', attempt.completed_at)", 'date')
      .addSelect(
        'ROUND(AVG(attempt.total_points::numeric / attempt.max_possible_points::numeric * 100), 2)',
        'avgAccuracy',
      )
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .where('attempt.company_id = :companyId', { companyId });

    if (from) {
      qb.andWhere('attempt.completed_at >= :from', { from });
    }
    if (to) {
      qb.andWhere('attempt.completed_at <= :to', { to });
    }

    return qb
      .groupBy("DATE_TRUNC('day', attempt.completed_at)")
      .orderBy("DATE_TRUNC('day', attempt.completed_at)", 'ASC')
      .getRawMany<ScoreDynamicsRow>();
  }

  async getCompanyUserScoreDynamics(
    companyId: string,
    targetUserId: string,
    from?: Date,
    to?: Date,
  ): Promise<ScoreDynamicsRow[]> {
    return this.getUserScoreDynamics(targetUserId, from, to, companyId);
  }

  async getUserDurationStats(userId: string, from?: Date, to?: Date, companyId?: string): Promise<DurationStatsRaw> {
    const qb = this.createQueryBuilder('attempt')
      .select('AVG(attempt.duration_seconds)', 'avgDuration')
      .addSelect('MIN(attempt.duration_seconds)', 'bestDuration')
      .addSelect('MAX(attempt.duration_seconds)', 'worstDuration')
      .where('attempt.user_id = :userId', { userId })
      .andWhere('attempt.duration_seconds IS NOT NULL');

    if (companyId) {
      qb.andWhere('attempt.company_id = :companyId', { companyId });
    }
    if (from) {
      qb.andWhere('attempt.completed_at >= :from', { from });
    }
    if (to) {
      qb.andWhere('attempt.completed_at <= :to', { to });
    }

    const stats = await qb.getRawOne<DurationStatsRaw>();
    return stats ?? { avgDuration: null, bestDuration: null, worstDuration: null };
  }

  async getUserDurationDynamics(
    userId: string,
    from?: Date,
    to?: Date,
    companyId?: string,
  ): Promise<DurationDynamicsRaw[]> {
    const qb = this.createQueryBuilder('attempt')
      .select('attempt.id', 'attemptId')
      .addSelect('attempt.completed_at', 'completedAt')
      .addSelect('attempt.duration_seconds', 'durationSeconds')
      .addSelect('attempt.total_points', 'totalPoints')
      .addSelect('attempt.max_possible_points', 'maxPossiblePoints')
      .where('attempt.user_id = :userId', { userId });

    if (companyId) {
      qb.andWhere('attempt.company_id = :companyId', { companyId });
    }
    if (from) {
      qb.andWhere('attempt.completed_at >= :from', { from });
    }
    if (to) {
      qb.andWhere('attempt.completed_at <= :to', { to });
    }

    return qb.orderBy('attempt.completed_at', 'ASC').getRawMany<DurationDynamicsRaw>();
  }

  async getUserAttemptDates(userId: string, companyId?: string): Promise<Date[]> {
    const qb = this.createQueryBuilder('attempt')
      .select('attempt.completed_at', 'completedAt')
      .where('attempt.user_id = :userId', { userId });

    if (companyId) {
      qb.andWhere('attempt.company_id = :companyId', { companyId });
    }

    const rows = await qb.orderBy('attempt.completed_at', 'ASC').getRawMany<{ completedAt: Date }>();

    return rows.map((r) => r.completedAt);
  }

  async getUserAttemptsForPerformance(
    userId: string,
    from?: Date,
    to?: Date,
    companyId?: string,
  ): Promise<PerformanceRaw[]> {
    const qb = this.createQueryBuilder('attempt')
      .select('attempt.total_points', 'totalPoints')
      .addSelect('attempt.max_possible_points', 'maxPossiblePoints')
      .where('attempt.user_id = :userId', { userId });

    if (companyId) {
      qb.andWhere('attempt.company_id = :companyId', { companyId });
    }
    if (from) {
      qb.andWhere('attempt.completed_at >= :from', { from });
    }
    if (to) {
      qb.andWhere('attempt.completed_at <= :to', { to });
    }

    return qb.getRawMany<PerformanceRaw>();
  }
}
