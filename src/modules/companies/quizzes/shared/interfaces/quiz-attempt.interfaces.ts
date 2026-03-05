import { Quiz } from '../../entities/quiz.entity';
import { PerformanceLevel } from '../../enums/quiz-performance-level.enum';

export interface QuizAttemptAnswer {
  questionIndex: number;
  selectedOptionIndexes: number[];
  correctOptionIndexes: number[];
  questionScore: number;
}

export interface PerformanceResult {
  level: PerformanceLevel;
  message: string;
  accuracyPercent: number;
}

export interface PerformanceThreshold {
  min: number;
  max: number;
  level: PerformanceLevel;
  message: string;
}

export interface BuildSnapshotParams {
  attemptId: string;
  userId: string;
  companyId: string;
  quiz: Quiz;
  answers: QuizAttemptAnswer[];
  totalPoints: number;
  completedAt: Date;
}
