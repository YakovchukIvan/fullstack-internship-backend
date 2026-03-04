import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';

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

export class LeaderboardTableResponseDto extends PaginatedBaseResponseDto {
  leaderboard: LeaderboardTableEntryDto[];
  totalMembers: number;
  minimumAttemptsRequired: number;
}
