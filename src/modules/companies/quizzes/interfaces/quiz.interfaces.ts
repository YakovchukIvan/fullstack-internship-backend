import { CompanyRole } from '@/common/enums/company-role.enum';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswers: number[];
}

export interface QuizCreatedBySnapshot {
  displayName: string;
  role: CompanyRole;
}
