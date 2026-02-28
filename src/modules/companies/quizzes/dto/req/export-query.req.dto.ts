import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import { ExportFormat } from '../../enums/export-format.enum';

export class ExportQueryDto {
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.JSON;

  @IsOptional()
  @IsUUID()
  quizId?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class PersonalExportQueryDto extends ExportQueryDto {
  @IsOptional()
  @IsString()
  companySlug?: string;
}
