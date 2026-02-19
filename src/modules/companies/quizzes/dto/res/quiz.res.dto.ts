import { CompanyRole } from '@/common/enums/company-role.enum';

export class QuizQuestionResponseDto {
  question: string;
  options: string[];
  correctAnswers: number[];
}

export class QuizCreatedBySnapshotDto {
  displayName: string;
  role: CompanyRole;
}

export class QuizResponseDto {
  id: string;
  title: string;
  description: string | null;
  frequencyInDays: number;
  questions: QuizQuestionResponseDto[];
  createdByUserId: string;
  createdBy: QuizCreatedBySnapshotDto;
  isAiGenerated: boolean;
  aiPrompt: string | null;
  createdAt: string;
  updatedAt: string;
  quotaRemaining: number | null;
}
