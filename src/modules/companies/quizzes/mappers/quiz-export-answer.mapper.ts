import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';
import { ExportAttemptDto } from '../dto/res/export.res.dto';

export function toExportAttemptDto(snapshot: QuizAnswerSnapshot): ExportAttemptDto {
  return {
    attemptId: snapshot.attemptId,
    quizId: snapshot.quizId,
    quizTitle: snapshot.quizTitle,
    completedAt: snapshot.completedAt,
    totalPoints: snapshot.totalPoints,
    maxPossiblePoints: snapshot.maxPossiblePoints,
    accuracyPercent: Number(((snapshot.totalPoints / snapshot.maxPossiblePoints) * 100).toFixed(2)),
    answers: snapshot.answers,
  };
}
