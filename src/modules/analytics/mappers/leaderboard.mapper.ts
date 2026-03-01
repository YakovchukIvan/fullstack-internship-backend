import { LeaderboardRawRow } from '@/modules/analytics/interfaces/analytics.interfaces';
import { LeaderboardEntryDto } from '../dto/res/leaderboard.res.dto';
import { calculateRating } from '../../companies/quizzes/helper/quiz-math.helper';

export function toLeaderboardEntryDto(row: LeaderboardRawRow, rank: number): LeaderboardEntryDto {
  return {
    userId: row.userId,
    displayName: `${row.firstName} ${row.lastName}`.trim(),
    avatarUrl: row.avatarUrl ?? null,
    rating: calculateRating(Number(row.sumPoints), Number(row.sumMaxPoints)),
    totalAttempts: Number(row.totalAttempts),
    rank,
  };
}
