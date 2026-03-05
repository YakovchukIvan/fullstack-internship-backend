import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { ScoreDynamicsRow } from '../interfaces/dynamics.interfaces';
import { LeaderboardRawRow, QuizAttemptSummaryRaw } from '../interfaces/company.interfaces';
import { PaginationParams } from '../interfaces/pagination-analytics-params.interface';

@Injectable()
export class CompanyAnalyticsRepository extends Repository<QuizAttempt> {
  constructor(dataSource: DataSource) {
    super(QuizAttempt, dataSource.createEntityManager());
  }

  async getLeaderboardByCompany(
    companyId: string,
    pagination: PaginationParams,
  ): Promise<{ rows: LeaderboardRawRow[]; total: number }> {
    const offset = (pagination.page - 1) * pagination.limit;

    const rows = await this.createQueryBuilder('attempt')
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
      .limit(pagination.limit)
      .offset(offset)
      .getRawMany<LeaderboardRawRow>();

    const totalResult = await this.createQueryBuilder('attempt')
      .select('COUNT(DISTINCT attempt.user_id)', 'total')
      .where('attempt.company_id = :companyId', { companyId })
      .getRawOne<{ total: string }>();

    return { rows, total: Number(totalResult?.total ?? 0) };
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

  async getQuizAttemptsSummary(
    quizId: string,
    companyId: string,
    pagination: PaginationParams,
  ): Promise<{ rows: QuizAttemptSummaryRaw[]; total: number }> {
    const offset = (pagination.page - 1) * pagination.limit;

    const rows = await this.createQueryBuilder('attempt')
      .select('attempt.user_id', 'userId')
      .addSelect('user.first_name', 'firstName')
      .addSelect('user.last_name', 'lastName')
      .addSelect('user.avatar_url', 'avatarUrl')
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
      .addSelect('AVG(attempt.duration_seconds)', 'avgDuration')
      .innerJoin('attempt.user', 'user')
      .where('attempt.quiz_id = :quizId', { quizId })
      .andWhere('attempt.company_id = :companyId', { companyId })
      .groupBy('attempt.user_id')
      .addGroupBy('user.first_name')
      .addGroupBy('user.last_name')
      .addGroupBy('user.avatar_url')
      .orderBy('MAX(attempt.completed_at)', 'DESC')
      .limit(pagination.limit)
      .offset(offset)
      .getRawMany<QuizAttemptSummaryRaw>();

    const countResult = await this.createQueryBuilder('attempt')
      .select('COUNT(DISTINCT attempt.user_id)', 'total')
      .where('attempt.quiz_id = :quizId', { quizId })
      .andWhere('attempt.company_id = :companyId', { companyId })
      .getRawOne<{ total: string }>();

    return { rows, total: Number(countResult?.total ?? 0) };
  }

  async getQuizTitle(quizId: string): Promise<string | null> {
    const result = await this.createQueryBuilder('attempt')
      .select('quiz.title', 'title')
      .innerJoin('attempt.quiz', 'quiz')
      .where('attempt.quiz_id = :quizId', { quizId })
      .limit(1)
      .getRawOne<{ title: string }>();

    return result?.title ?? null;
  }
}
