import { ExportAttemptDto } from '@/modules/companies/quizzes/dto/res/attempt/export.res.dto';
import { QuizAnswerSnapshot } from '../../interfaces/quiz-answer-snapshot.interface';
import { calculateAccuracy } from '../../helpers/quiz-math.helper';

export function toExportAttemptResponseDto(snapshot: QuizAnswerSnapshot): ExportAttemptDto {
  return {
    attemptId: snapshot.attemptId,
    quizId: snapshot.quizId,
    quizTitle: snapshot.quizTitle,
    completedAt: snapshot.completedAt,
    totalPoints: snapshot.totalPoints,
    maxPossiblePoints: snapshot.maxPossiblePoints,
    accuracyPercent: calculateAccuracy(snapshot.totalPoints, snapshot.maxPossiblePoints),
    answers: snapshot.answers,
  };
}
