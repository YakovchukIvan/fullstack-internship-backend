import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class PersonalAnalyticsQueryDto extends AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  companySlug?: string;
}
