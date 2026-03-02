export class ExportAnswerRecordDto {
  questionIndex: number;
  questionText: string;
  options: string[];
  selectedAnswers: number[];
  correctAnswers: number[];
  isCorrect: boolean;
  questionScore: number;
}

export class ExportAttemptDto {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  completedAt: string;
  totalPoints: number;
  maxPossiblePoints: number;
  accuracyPercent: number;
  answers: ExportAnswerRecordDto[];
}

export class ExportSummaryDto {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
}

export class CompanyExportResponseDto {
  companyId: string;
  exportedAt: string;
  totalUsers: number;
  summary: ExportSummaryDto;
  attempts: ExportAttemptDto[];
}
