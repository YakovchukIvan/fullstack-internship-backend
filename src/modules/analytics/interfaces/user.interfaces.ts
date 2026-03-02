import { DurationStatsRaw, PerformanceRaw, ScoreDynamicsRow } from './dynamics.interfaces';

export interface UserRatingRaw {
  sumPoints: string;
  sumMaxPoints: string;
  totalAttempts: string;
}

export interface LastAttemptRaw {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  completedAt: Date;
  totalPoints: string;
  maxPossiblePoints: string;
  durationSeconds: number;
}

export interface UserQuizSummaryRaw {
  quizId: string;
  quizTitle: string;
  totalAttempts: string;
  lastCompletedAt: Date;
  bestAccuracy: string;
  avgAccuracy: string;
}

export interface UserAnalyticsQueryParams {
  userId: string;
  companyId: string;
  from?: Date;
  to?: Date;
}

export interface BuildUserAnalyticsProfileParams {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  ratingRaw: UserRatingRaw;
  dynamicsRows: ScoreDynamicsRow[];
  performanceRaw: PerformanceRaw[];
  durationStats: DurationStatsRaw;
  lastAttemptsRaw: LastAttemptRaw[];
}
