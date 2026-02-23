import { ExportAttemptDto, ExportSummaryDto } from '@/modules/companies/quizzes/dto/res/export.res.dto';

export class UserExportResponseDto {
  userId: string;
  exportedAt: string;
  summary: ExportSummaryDto;
  attempts: ExportAttemptDto[];
}
