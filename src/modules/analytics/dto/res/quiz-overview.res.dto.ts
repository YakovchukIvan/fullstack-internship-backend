export class UserQuizSummaryItemDto {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  lastCompletedAt: string;
  bestAccuracy: number;
  avgAccuracy: number;
}

export class UserQuizzesResponseDto {
  quizzes: UserQuizSummaryItemDto[];
}

export class QuizAttemptSummaryItemDto {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalAttempts: number;
  lastCompletedAt: string;
  bestAccuracy: number;
  avgAccuracy: number;
  averageDurationSeconds: number | null;
}

export class QuizAttemptsOverviewResponseDto {
  quizId: string;
  quizTitle: string;
  totalParticipants: number;
  attempts: QuizAttemptSummaryItemDto[];
}
