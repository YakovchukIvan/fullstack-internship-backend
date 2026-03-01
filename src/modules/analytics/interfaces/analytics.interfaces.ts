export interface LeaderboardRawRow {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  sumPoints: string;
  sumMaxPoints: string;
  totalAttempts: string;
  avgDuration: string | null;
}

export interface ScoreDynamicsRow {
  date: string;
  avgAccuracy: string;
  totalAttempts: string;
}

export interface DurationStatsRaw {
  avgDuration: string | null;
  bestDuration: string | null;
  worstDuration: string | null;
}

export interface DurationDynamicsRaw {
  attemptId: string;
  completedAt: Date;
  durationSeconds: number | null;
  totalPoints: string;
  maxPossiblePoints: string;
}

export interface PerformanceRaw {
  totalPoints: string;
  maxPossiblePoints: string;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}
