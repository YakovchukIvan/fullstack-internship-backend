import { PerformanceLevel } from '../../enums/quiz-performance-level.enum';
import { PerformanceResult } from '../interfaces/quiz-attempt.interfaces';

const PERFORMANCE_THRESHOLDS: Array<{
  min: number;
  max: number;
  level: PerformanceLevel;
  message: string;
}> = [
  { min: 0, max: 20, level: PerformanceLevel.POOR, message: 'Needs improvement. Keep practicing!' },
  { min: 20, max: 40, level: PerformanceLevel.NOT_BAD, message: 'Not bad, but there is room to grow.' },
  { min: 40, max: 60, level: PerformanceLevel.GOOD, message: 'Good effort! You are getting there.' },
  { min: 60, max: 80, level: PerformanceLevel.GREAT, message: 'Great job! You know this well.' },
  { min: 80, max: 100, level: PerformanceLevel.EXCELLENT, message: 'Excellent! Outstanding result.' },
];

export function getPerformanceResult(accuracyPercent: number): PerformanceResult {
  if (accuracyPercent === 100) {
    return {
      level: PerformanceLevel.PERFECT,
      message: 'Perfect score! Magnifico! 🏆',
      accuracyPercent,
    };
  }

  const threshold =
    PERFORMANCE_THRESHOLDS.find((t) => accuracyPercent >= t.min && accuracyPercent < t.max) ??
    PERFORMANCE_THRESHOLDS[0];

  return {
    level: threshold.level,
    message: threshold.message,
    accuracyPercent,
  };
}
