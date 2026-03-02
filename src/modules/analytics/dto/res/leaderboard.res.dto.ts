export class LeaderboardTableEntryDto {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number;
  ratingPercent: number;
  totalAttempts: number;
  averageDurationSeconds: number | null;
  rank: number;
  hasMinimumAttempts: boolean;
}

export class LeaderboardTableResponseDto {
  leaderboard: LeaderboardTableEntryDto[];
  totalMembers: number;
  minimumAttemptsRequired: number;
}
