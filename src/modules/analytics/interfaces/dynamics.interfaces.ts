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
  durationSeconds: number;
  totalPoints: string;
  maxPossiblePoints: string;
}

export interface PerformanceRaw {
  totalPoints: string;
  maxPossiblePoints: string;
}
