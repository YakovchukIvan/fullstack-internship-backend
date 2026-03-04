import { PerformanceLevel } from '../../enums/quiz-performance-level.enum';

export class QuizAttemptAnswerDto {
  questionIndex: number;
  selectedOptionIndexes: number[];
  correctOptionIndexes: number[];
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
  durationSeconds: number;
  completedAt: string;
}
