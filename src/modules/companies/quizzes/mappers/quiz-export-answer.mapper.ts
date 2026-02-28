import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';
import { ExportAttemptDto } from '../dto/res/export.res.dto';
import { calculateAccuracy } from '../helper/quiz-math.helper';

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
