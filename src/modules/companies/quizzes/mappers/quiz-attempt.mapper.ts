import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { QuizAttemptResponseDto } from '../dto/res/quiz-attempt.res.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { getPerformanceResult } from '../helper/quiz-performance.helper';

export function toQuizAttemptResponseDto(attempt: QuizAttempt): QuizAttemptResponseDto {
  const accuracyPercent = Number(((attempt.totalPoints / attempt.maxPossiblePoints) * 100).toFixed(2));
  const performance = getPerformanceResult(accuracyPercent);

  return {
    id: attempt.id,
    quizId: attempt.quizId,
    companyId: attempt.companyId,
    totalPoints: attempt.totalPoints,
    maxPossiblePoints: attempt.maxPossiblePoints,
    accuracyPercent,
    performanceLevel: performance.level,
    performanceMessage: performance.message,
    answers: attempt.answers.map((a) => ({
      ...a,
      questionScore: Number((a.questionScore * 100).toFixed(2)),
    })),
    durationSeconds: attempt.durationSeconds ?? null,
    completedAt: toIso(attempt.completedAt),
  };
}
