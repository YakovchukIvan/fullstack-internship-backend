import { toIso } from '@/common/helpers/date.transformer';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { QuizAttemptResponseDto } from '@/modules/companies/quizzes/dto/res/quiz/quiz-attempt.res.dto';
import { calculateAccuracy } from '../../helpers/quiz-math.helper';
import { getPerformanceResult } from '../../helpers/quiz-performance.helper';

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
    durationSeconds: attempt.durationSeconds,
    completedAt: toIso(attempt.completedAt),
  };
}
