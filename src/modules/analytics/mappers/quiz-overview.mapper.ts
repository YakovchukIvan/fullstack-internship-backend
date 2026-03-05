import { QuizAttemptSummaryRaw } from '../interfaces/company.interfaces';
import { UserQuizSummaryRaw } from '../interfaces/user.interfaces';
import { QuizAttemptSummaryItemDto, UserQuizSummaryItemDto } from '../dto/res/quiz-overview.res.dto';

export function toUserQuizSummaryItems(rows: UserQuizSummaryRaw[]): UserQuizSummaryItemDto[] {
  return rows.map(
    (row): UserQuizSummaryItemDto => ({
      quizId: row.quizId,
      quizTitle: row.quizTitle,
      totalAttempts: Number(row.totalAttempts),
      lastCompletedAt: new Date(row.lastCompletedAt).toISOString(),
      bestAccuracy: Number(row.bestAccuracy),
      avgAccuracy: Number(row.avgAccuracy),
    }),
  );
}

export function toQuizAttemptSummaryItems(rows: QuizAttemptSummaryRaw[]): QuizAttemptSummaryItemDto[] {
  return rows.map(
    (row): QuizAttemptSummaryItemDto => ({
      userId: row.userId,
      displayName: `${row.firstName} ${row.lastName}`.trim(),
      avatarUrl: row.avatarUrl ?? null,
      totalAttempts: Number(row.totalAttempts),
      lastCompletedAt: new Date(row.lastCompletedAt).toISOString(),
      bestAccuracy: Number(row.bestAccuracy),
      avgAccuracy: Number(row.avgAccuracy),
      averageDurationSeconds: row.avgDuration ? Math.round(Number(row.avgDuration)) : null,
    }),
  );
}
