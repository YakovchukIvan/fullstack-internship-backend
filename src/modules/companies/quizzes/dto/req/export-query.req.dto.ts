import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ExportFormat } from '../../enums/export-format.enum';
export class ExportQueryDto {
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.JSON;

  @IsOptional()
  @IsUUID()
  quizId?: string;
}
