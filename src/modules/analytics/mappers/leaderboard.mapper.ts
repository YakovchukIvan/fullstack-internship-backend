import { LeaderboardRawRow } from '../interfaces/company.interfaces';
import { LeaderboardTableEntryDto } from '../dto/res/leaderboard.res.dto';
import { calculateAccuracy, calculateRating } from '@/modules/companies/quizzes/shared/helpers/quiz-math.helper';
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

export function toLeaderboardEntries(rows: LeaderboardRawRow[]): LeaderboardTableEntryDto[] {
  return rows.map((row, index) => toLeaderboardTableEntryDto(row, index + 1));
}
