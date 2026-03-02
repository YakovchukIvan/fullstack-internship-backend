import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';
import { calculateAccuracy } from '../helpers/quiz-math.helper';
import { ExportAttemptDto } from '../../dto/res/export.res.dto';

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
