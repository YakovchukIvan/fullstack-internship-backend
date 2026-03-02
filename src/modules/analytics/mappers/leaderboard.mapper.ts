import { LeaderboardRawRow } from '../interfaces/company.interfaces';
import { LeaderboardTableEntryDto, LeaderboardTableResponseDto } from '../dto/res/leaderboard.res.dto';
import { calculateAccuracy, calculateRating } from '@/modules/companies/quizzes/helper/quiz-math.helper';
import { ANALYTICS_CONSTANTS } from '../constants/analytics.constants';

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
