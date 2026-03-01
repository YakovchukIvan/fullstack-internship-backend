import { PerformanceLevel } from '@/modules/companies/quizzes/enums/quiz-performance-level.enum';

export class StreakResponseDto {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

export class ScoreDynamicsItemDto {
  date: string;
  avgAccuracy: number;
  totalAttempts: number;
}

export class ScoreDynamicsResponseDto {
  dynamics: ScoreDynamicsItemDto[];
}

export class DurationDynamicsItemDto {
  attemptId: string;
  completedAt: string;
  durationSeconds: number | null;
  accuracyPercent: number;
}

export class DurationStatsResponseDto {
  averageDurationSeconds: number | null;
  bestDurationSeconds: number | null;
  worstDurationSeconds: number | null;
  dynamics: DurationDynamicsItemDto[];
}

export class PerformanceDistributionItemDto {
  level: PerformanceLevel;
  count: number;
  percent: number;
}

export class PerformanceDistributionResponseDto {
  distribution: PerformanceDistributionItemDto[];
}

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
