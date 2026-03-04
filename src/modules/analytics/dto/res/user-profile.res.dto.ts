import { PerformanceLevel } from '@/modules/companies/quizzes/enums/quiz-performance-level.enum';
import { PerformanceDistributionItemDto } from './performance.res.dto';
import { ScoreDynamicsItemDto } from './dynamics.res.dto';
import { StreakResponseDto } from './streak.res.dto';
import { UserRatingResponseDto } from '@/common/dto/res/user-rating.res.dto';

export class DurationSummaryDto {
  averageDurationSeconds: number | null;
  bestDurationSeconds: number | null;
  worstDurationSeconds: number | null;
}

export class LastAttemptItemDto {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  completedAt: string;
  accuracyPercent: number;
  durationSeconds: number;
  performanceLevel: PerformanceLevel;
}

export class UserAnalyticsProfileDto {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  streak: StreakResponseDto;
  rating: UserRatingResponseDto;
  dynamics: ScoreDynamicsItemDto[];
  performance: PerformanceDistributionItemDto[];
  duration: DurationSummaryDto;
  lastAttempts: LastAttemptItemDto[];
}
