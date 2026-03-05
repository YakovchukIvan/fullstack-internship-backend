import { CompanyRole } from '@/common/enums/company-role.enum';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndexes: number[];
}

export interface QuizCreatedBySnapshot {
  displayName: string;
  role: CompanyRole;
}
