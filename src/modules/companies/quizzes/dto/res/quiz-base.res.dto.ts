import { CompanyRole } from '@/common/enums/company-role.enum';

export class QuizCreatedBySnapshotDto {
  displayName: string;
  role: CompanyRole;
}

export class QuizBaseResponseDto {
  id: string;
  title: string;
  description: string | null;
  frequencyInDays: number;
  timeLimitMinutes: number;
  createdByUserId: string;
  createdBy: QuizCreatedBySnapshotDto;
  isAiGenerated: boolean;
  aiPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}
