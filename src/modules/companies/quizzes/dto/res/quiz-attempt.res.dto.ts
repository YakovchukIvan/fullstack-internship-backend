import { PerformanceLevel } from '../../interfaces/quiz-attempt.interfaces';

export class QuizAttemptAnswerDto {
  questionIndex: number;
  selectedAnswers: number[];
  correctAnswers: number[];
  questionScore: number;
}

export class QuizAttemptResponseDto {
  id: string;
  quizId: string;
  companyId: string;
  totalPoints: number;
  maxPossiblePoints: number;
  accuracyPercent: number;
  performanceLevel: PerformanceLevel;
  performanceMessage: string;
  answers: QuizAttemptAnswerDto[];
  durationSeconds: number | null;
  completedAt: string;
}
