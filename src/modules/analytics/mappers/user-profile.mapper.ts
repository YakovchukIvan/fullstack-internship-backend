import { DurationStatsRaw, PerformanceRaw, ScoreDynamicsRow } from '../interfaces/dynamics.interfaces';
import { LastAttemptRaw, UserRatingRaw } from '../interfaces/user.interfaces';
import { StreakResult } from '../interfaces/streak.interfaces';
import {
  DurationSummaryDto,
  LastAttemptItemDto,
  UserAnalyticsProfileDto,
  UserRatingAnalyticsDto,
} from '../dto/res/user-profile.res.dto';
import { PerformanceDistributionItemDto } from '../dto/res/performance.res.dto';
import { ScoreDynamicsItemDto } from '../dto/res/dynamics.res.dto';
import { StreakResponseDto } from '../dto/res/streak.res.dto';
import { calculateAccuracy, calculateRating } from '@/modules/companies/quizzes/helper/quiz-math.helper';
import { getPerformanceResult } from '@/modules/companies/quizzes/helper/quiz-performance.helper';
import { PerformanceLevel } from '@/modules/companies/quizzes/enums/quiz-performance-level.enum';
import { calculateStreak } from '../helpers/streak.helper';
import { User } from '@/modules/users/entities/user.entity';

interface UserAnalyticsProfileParams {
  user: User;
  dates: Date[];
  ratingRaw: UserRatingRaw;
  dynamicsRows: ScoreDynamicsRow[];
  performanceRaw: PerformanceRaw[];
  durationStats: DurationStatsRaw;
  lastAttemptsRaw: LastAttemptRaw[];
}

function toStreakDto(streak: StreakResult): StreakResponseDto {
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    completedToday: streak.completedToday,
  };
}

function toRatingDto(raw: UserRatingRaw): UserRatingAnalyticsDto {
  const totalPoints = Number(raw.sumPoints);
  const totalMaxPoints = Number(raw.sumMaxPoints);
  return {
    rating: calculateRating(totalPoints, totalMaxPoints),
    ratingPercent: calculateAccuracy(totalPoints, totalMaxPoints),
    totalAttempts: Number(raw.totalAttempts),
    totalPoints,
    totalMaxPoints,
  };
}

function toDynamicsItems(rows: ScoreDynamicsRow[]): ScoreDynamicsItemDto[] {
  return rows.map((row) => ({
    date: new Date(row.date).toISOString().slice(0, 10),
    avgAccuracy: Number(row.avgAccuracy),
    totalAttempts: Number(row.totalAttempts),
  }));
}

function toPerformanceItems(attempts: PerformanceRaw[]): PerformanceDistributionItemDto[] {
  const counts = Object.values(PerformanceLevel).reduce(
    (acc, level) => ({ ...acc, [level]: 0 }),
    {} as Record<PerformanceLevel, number>,
  );

  for (const attempt of attempts) {
    const accuracy = calculateAccuracy(Number(attempt.totalPoints), Number(attempt.maxPossiblePoints));
    const { level } = getPerformanceResult(accuracy);
    counts[level]++;
  }

  const total = attempts.length;
  return Object.values(PerformanceLevel).map((level) => ({
    level,
    count: counts[level],
    percent: total > 0 ? Number(((counts[level] / total) * 100).toFixed(2)) : 0,
  }));
}

function toDurationDto(stats: DurationStatsRaw): DurationSummaryDto {
  return {
    averageDurationSeconds: stats.avgDuration ? Math.round(Number(stats.avgDuration)) : null,
    bestDurationSeconds: stats.bestDuration ? Number(stats.bestDuration) : null,
    worstDurationSeconds: stats.worstDuration ? Number(stats.worstDuration) : null,
  };
}

function toLastAttemptItems(rows: LastAttemptRaw[]): LastAttemptItemDto[] {
  return rows.map((row) => {
    const accuracyPercent = calculateAccuracy(Number(row.totalPoints), Number(row.maxPossiblePoints));
    return {
      attemptId: row.attemptId,
      quizId: row.quizId,
      quizTitle: row.quizTitle,
      completedAt: new Date(row.completedAt).toISOString(),
      accuracyPercent,
      durationSeconds: row.durationSeconds,
      performanceLevel: getPerformanceResult(accuracyPercent).level,
    };
  });
}

export function toUserAnalyticsProfileDto(params: UserAnalyticsProfileParams): UserAnalyticsProfileDto {
  const { user, dates, ratingRaw, dynamicsRows, performanceRaw, durationStats, lastAttemptsRaw } = params;

  return {
    userId: user.id,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
    avatarUrl: user.avatarUrl ?? null,
    streak: toStreakDto(calculateStreak(dates)),
    rating: toRatingDto(ratingRaw),
    dynamics: toDynamicsItems(dynamicsRows),
    performance: toPerformanceItems(performanceRaw),
    duration: toDurationDto(durationStats),
    lastAttempts: toLastAttemptItems(lastAttemptsRaw),
  };
}
