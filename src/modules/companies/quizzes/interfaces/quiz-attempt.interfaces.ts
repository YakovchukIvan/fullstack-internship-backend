export interface QuizAttemptAnswer {
  questionIndex: number;
  selectedAnswers: number[];
  correctAnswers: number[];
  questionScore: number;
}

export enum PerformanceLevel {
  POOR = 'poor',
  NOT_BAD = 'not_bad',
  GOOD = 'good',
  GREAT = 'great',
  EXCELLENT = 'excellent',
  PERFECT = 'perfect',
}

export interface PerformanceResult {
  level: PerformanceLevel;
  message: string;
  accuracyPercent: number;
}
