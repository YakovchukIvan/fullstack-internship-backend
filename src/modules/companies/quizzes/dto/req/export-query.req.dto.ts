import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ExportFormat } from '../../enums/export-format.enum';
import { DateRangeQueryDto } from '@/common/dto/req/date-range-query.dto';

export class ExportQueryDto extends DateRangeQueryDto {
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.JSON;

  @IsOptional()
  @IsUUID()
  quizId?: string;
}

export class PersonalExportQueryDto extends ExportQueryDto {
  @IsOptional()
  @IsString()
  slug?: string;
}
