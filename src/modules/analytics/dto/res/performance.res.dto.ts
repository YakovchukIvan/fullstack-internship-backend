import { PerformanceLevel } from '@/modules/companies/quizzes/enums/quiz-performance-level.enum';

export class PerformanceDistributionItemDto {
  level: PerformanceLevel;
  count: number;
  percent: number;
}
