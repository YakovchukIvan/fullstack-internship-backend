import {
  DurationDynamicsRaw,
  DurationStatsRaw,
  LeaderboardRawRow,
  PerformanceRaw,
  ScoreDynamicsRow,
  StreakResult,
} from '../interfaces/analytics.interfaces';
import {
  DurationDynamicsItemDto,
  DurationStatsResponseDto,
  LeaderboardTableEntryDto,
  LeaderboardTableResponseDto,
  PerformanceDistributionItemDto,
  PerformanceDistributionResponseDto,
  ScoreDynamicsItemDto,
  ScoreDynamicsResponseDto,
  StreakResponseDto,
} from '../dto/res/analytics.res.dto';
import { calculateAccuracy, calculateRating } from '@/modules/companies/quizzes/helper/quiz-math.helper';
import { getPerformanceResult } from '@/modules/companies/quizzes/helper/quiz-performance.helper';
import { PerformanceLevel } from '@/modules/companies/quizzes/enums/quiz-performance-level.enum';
import { ANALYTICS_CONSTANTS } from '../constants/analytics.constants';

export function toStreakResponseDto(streak: StreakResult): StreakResponseDto {
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    completedToday: streak.completedToday,
  };
}

export function toScoreDynamicsItemDto(row: ScoreDynamicsRow): ScoreDynamicsItemDto {
  return {
    date: new Date(row.date).toISOString().slice(0, 10),
    avgAccuracy: Number(row.avgAccuracy),
    totalAttempts: Number(row.totalAttempts),
  };
}

export function toScoreDynamicsResponseDto(rows: ScoreDynamicsRow[]): ScoreDynamicsResponseDto {
  return {
    dynamics: rows.map(toScoreDynamicsItemDto),
  };
}

export function toDurationDynamicsItemDto(row: DurationDynamicsRaw): DurationDynamicsItemDto {
  return {
    attemptId: row.attemptId,
    completedAt: new Date(row.completedAt).toISOString(),
    durationSeconds: row.durationSeconds,
    accuracyPercent: calculateAccuracy(Number(row.totalPoints), Number(row.maxPossiblePoints)),
  };
}

export function toDurationStatsResponseDto(
  stats: DurationStatsRaw,
  dynamics: DurationDynamicsRaw[],
): DurationStatsResponseDto {
  return {
    averageDurationSeconds: stats.avgDuration ? Math.round(Number(stats.avgDuration)) : null,
    bestDurationSeconds: stats.bestDuration ? Number(stats.bestDuration) : null,
    worstDurationSeconds: stats.worstDuration ? Number(stats.worstDuration) : null,
    dynamics: dynamics.map(toDurationDynamicsItemDto),
  };
}

export function toLeaderboardTableEntryDto(row: LeaderboardRawRow, rank: number): LeaderboardTableEntryDto {
  const totalAttempts = Number(row.totalAttempts);
  return {
    userId: row.userId,
    displayName: `${row.firstName} ${row.lastName}`.trim(),
    avatarUrl: row.avatarUrl ?? null,
    rating: calculateRating(Number(row.sumPoints), Number(row.sumMaxPoints)),
    ratingPercent: calculateAccuracy(Number(row.sumPoints), Number(row.sumMaxPoints)),
    totalAttempts,
    averageDurationSeconds: row.avgDuration ? Math.round(Number(row.avgDuration)) : null,
    rank,
    hasMinimumAttempts: totalAttempts >= ANALYTICS_CONSTANTS.MINIMUM_ATTEMPTS_FOR_RATING,
  };
}

export function toLeaderboardTableResponseDto(
  rows: LeaderboardRawRow[],
  totalMembers: number,
): LeaderboardTableResponseDto {
  return {
    leaderboard: rows.map((row, index) => toLeaderboardTableEntryDto(row, index + 1)),
    totalMembers,
    minimumAttemptsRequired: ANALYTICS_CONSTANTS.MINIMUM_ATTEMPTS_FOR_RATING,
  };
}

export function toPerformanceDistributionResponseDto(attempts: PerformanceRaw[]): PerformanceDistributionResponseDto {
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

  const distribution: PerformanceDistributionItemDto[] = Object.values(PerformanceLevel).map((level) => ({
    level,
    count: counts[level],
    percent: total > 0 ? Number(((counts[level] / total) * 100).toFixed(2)) : 0,
  }));

  return { distribution };
}
