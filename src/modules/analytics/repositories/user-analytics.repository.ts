import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import {
  DurationDynamicsRaw,
  DurationStatsRaw,
  PerformanceRaw,
  ScoreDynamicsRow,
} from '../interfaces/dynamics.interfaces';
import {
  LastAttemptRaw,
  UserAnalyticsQueryParams,
  UserQuizSummaryRaw,
  UserRatingRaw,
} from '../interfaces/user.interfaces';
import { PaginationParams } from '../interfaces/pagination-analytics-params.interface';

@Injectable()
export class UserAnalyticsRepository extends Repository<QuizAttempt> {
  constructor(dataSource: DataSource) {
    super(QuizAttempt, dataSource.createEntityManager());
  }

  async getUserScoreDynamics(params: UserAnalyticsQueryParams): Promise<ScoreDynamicsRow[]> {
    const qb = this.createQueryBuilder('attempt')
      .select("DATE_TRUNC('day', attempt.completed_at)", 'date')
      .addSelect(
        'ROUND(AVG(attempt.total_points::numeric / attempt.max_possible_points::numeric * 100), 2)',
        'avgAccuracy',
      )
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .where('attempt.user_id = :userId', { userId: params.userId })
      .andWhere('attempt.company_id = :companyId', { companyId: params.companyId });

    if (params.from) {
      qb.andWhere('attempt.completed_at >= :from', { from: params.from });
    }
    if (params.to) {
      qb.andWhere('attempt.completed_at <= :to', { to: params.to });
    }

    return qb
      .groupBy("DATE_TRUNC('day', attempt.completed_at)")
      .orderBy("DATE_TRUNC('day', attempt.completed_at)", 'ASC')
      .getRawMany<ScoreDynamicsRow>();
  }

  async getUserDurationStats(params: UserAnalyticsQueryParams): Promise<DurationStatsRaw> {
    const qb = this.createQueryBuilder('attempt')
      .select('AVG(attempt.duration_seconds)', 'avgDuration')
      .addSelect('MIN(attempt.duration_seconds)', 'bestDuration')
      .addSelect('MAX(attempt.duration_seconds)', 'worstDuration')
      .where('attempt.user_id = :userId', { userId: params.userId })
      .andWhere('attempt.company_id = :companyId', { companyId: params.companyId })
      .andWhere('attempt.duration_seconds IS NOT NULL');

    if (params.from) {
      qb.andWhere('attempt.completed_at >= :from', { from: params.from });
    }
    if (params.to) {
      qb.andWhere('attempt.completed_at <= :to', { to: params.to });
    }

    const stats = await qb.getRawOne<DurationStatsRaw>();
    return stats ?? { avgDuration: null, bestDuration: null, worstDuration: null };
  }

  async getUserDurationDynamics(params: UserAnalyticsQueryParams): Promise<DurationDynamicsRaw[]> {
    const qb = this.createQueryBuilder('attempt')
      .select('attempt.id', 'attemptId')
      .addSelect('attempt.completed_at', 'completedAt')
      .addSelect('attempt.duration_seconds', 'durationSeconds')
      .addSelect('attempt.total_points', 'totalPoints')
      .addSelect('attempt.max_possible_points', 'maxPossiblePoints')
      .where('attempt.user_id = :userId', { userId: params.userId })
      .andWhere('attempt.company_id = :companyId', { companyId: params.companyId });

    if (params.from) {
      qb.andWhere('attempt.completed_at >= :from', { from: params.from });
    }
    if (params.to) {
      qb.andWhere('attempt.completed_at <= :to', { to: params.to });
    }

    return qb.orderBy('attempt.completed_at', 'ASC').getRawMany<DurationDynamicsRaw>();
  }

  async getUserAttemptDates(params: UserAnalyticsQueryParams): Promise<Date[]> {
    const qb = this.createQueryBuilder('attempt')
      .select('attempt.completed_at', 'completedAt')
      .where('attempt.user_id = :userId', { userId: params.userId })
      .andWhere('attempt.company_id = :companyId', { companyId: params.companyId });

    if (params.from) {
      qb.andWhere('attempt.completed_at >= :from', { from: params.from });
    }
    if (params.to) {
      qb.andWhere('attempt.completed_at <= :to', { to: params.to });
    }

    const rows = await qb.orderBy('attempt.completed_at', 'ASC').getRawMany<{ completedAt: Date }>();

    return rows.map((r) => r.completedAt);
  }

  async getUserAttemptsForPerformance(params: UserAnalyticsQueryParams): Promise<PerformanceRaw[]> {
    const qb = this.createQueryBuilder('attempt')
      .select('attempt.total_points', 'totalPoints')
      .addSelect('attempt.max_possible_points', 'maxPossiblePoints')
      .where('attempt.user_id = :userId', { userId: params.userId })
      .andWhere('attempt.company_id = :companyId', { companyId: params.companyId });

    if (params.from) {
      qb.andWhere('attempt.completed_at >= :from', { from: params.from });
    }
    if (params.to) {
      qb.andWhere('attempt.completed_at <= :to', { to: params.to });
    }

    return qb.getRawMany<PerformanceRaw>();
  }

  async getUserLastAttempts(userId: string, companyId: string, limit = 10): Promise<LastAttemptRaw[]> {
    return this.createQueryBuilder('attempt')
      .select('attempt.id', 'attemptId')
      .addSelect('attempt.quiz_id', 'quizId')
      .addSelect('quiz.title', 'quizTitle')
      .addSelect('attempt.completed_at', 'completedAt')
      .addSelect('attempt.total_points', 'totalPoints')
      .addSelect('attempt.max_possible_points', 'maxPossiblePoints')
      .addSelect('attempt.duration_seconds', 'durationSeconds')
      .innerJoin('attempt.quiz', 'quiz')
      .where('attempt.user_id = :userId', { userId })
      .andWhere('attempt.company_id = :companyId', { companyId })
      .orderBy('attempt.completed_at', 'DESC')
      .limit(limit)
      .getRawMany<LastAttemptRaw>();
  }

  async getUserRatingInCompany(userId: string, companyId: string): Promise<UserRatingRaw> {
    const result = await this.createQueryBuilder('attempt')
      .select('SUM(attempt.total_points)', 'sumPoints')
      .addSelect('SUM(attempt.max_possible_points)', 'sumMaxPoints')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .where('attempt.user_id = :userId', { userId })
      .andWhere('attempt.company_id = :companyId', { companyId })
      .getRawOne<UserRatingRaw>();

    return result ?? { sumPoints: '0', sumMaxPoints: '0', totalAttempts: '0' };
  }

  async getUserQuizzesSummary(
    userId: string,
    companyId: string,
    pagination: PaginationParams,
  ): Promise<{ rows: UserQuizSummaryRaw[]; total: number }> {
    const offset = (pagination.page - 1) * pagination.limit;

    const rows = await this.createQueryBuilder('attempt')
      .select('attempt.quiz_id', 'quizId')
      .addSelect('quiz.title', 'quizTitle')
      .addSelect('COUNT(attempt.id)', 'totalAttempts')
      .addSelect('MAX(attempt.completed_at)', 'lastCompletedAt')
      .addSelect(
        'ROUND(MAX(attempt.total_points::numeric / attempt.max_possible_points::numeric * 100), 2)',
        'bestAccuracy',
      )
      .addSelect(
        'ROUND(AVG(attempt.total_points::numeric / attempt.max_possible_points::numeric * 100), 2)',
        'avgAccuracy',
      )
      .innerJoin('attempt.quiz', 'quiz')
      .where('attempt.user_id = :userId', { userId })
      .andWhere('attempt.company_id = :companyId', { companyId })
      .groupBy('attempt.quiz_id')
      .addGroupBy('quiz.title')
      .orderBy('MAX(attempt.completed_at)', 'DESC')
      .limit(pagination.limit)
      .offset(offset)
      .getRawMany<UserQuizSummaryRaw>();

    const totalResult = await this.createQueryBuilder('attempt')
      .select('COUNT(DISTINCT attempt.quiz_id)', 'total')
      .where('attempt.user_id = :userId', { userId })
      .andWhere('attempt.company_id = :companyId', { companyId })
      .getRawOne<{ total: string }>();

    return { rows, total: Number(totalResult?.total ?? 0) };
  }
}
