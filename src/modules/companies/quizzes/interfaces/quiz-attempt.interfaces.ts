import { PerformanceLevel } from '../enums/quiz-performance-level.enum';

export interface QuizAttemptAnswer {
  questionIndex: number;
  selectedAnswers: number[];
  correctAnswers: number[];
  questionScore: number;
}

export interface PerformanceResult {
  level: PerformanceLevel;
  message: string;
  accuracyPercent: number;
}
