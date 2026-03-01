export class LeaderboardEntryDto {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number;
  totalAttempts: number;
  rank: number;
}

export class CompanyLeaderboardResponseDto {
  leaderboard: LeaderboardEntryDto[];
  totalMembers: number;
}
