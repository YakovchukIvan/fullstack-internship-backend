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

export interface QuizAttemptSummaryRaw {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  totalAttempts: string;
  lastCompletedAt: Date;
  bestAccuracy: string;
  avgAccuracy: string;
  avgDuration: string | null;
}
