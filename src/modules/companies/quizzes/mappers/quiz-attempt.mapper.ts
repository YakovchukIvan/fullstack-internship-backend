import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { QuizAttemptResponseDto } from '../dto/res/quiz-attempt.res.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { getPerformanceResult } from '../helper/quiz-performance.helper';
import { calculateAccuracy } from '../helper/quiz-math.helper';

export function toQuizAttemptResponseDto(attempt: QuizAttempt): QuizAttemptResponseDto {
  const accuracyPercent = calculateAccuracy(attempt.totalPoints, attempt.maxPossiblePoints);
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
    durationSeconds: attempt.durationSeconds ?? null,
    completedAt: toIso(attempt.completedAt),
  };
}

export function toAttemptCreatePayload(
  userId: string,
  quizId: string,
  companyId: string,
  totalPoints: number,
  maxPossiblePoints: number,
  completedAt: Date,
  durationSeconds?: number,
) {
  return { userId, quizId, companyId, totalPoints, maxPossiblePoints, durationSeconds, completedAt };
}
