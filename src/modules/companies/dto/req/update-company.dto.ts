import { IsOptional, IsString, MaxLength, MinLength, IsUrl, IsBoolean } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  @MaxLength(255, { message: 'Company name must not exceed 255 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'isVisible must be a boolean' })
  isVisible?: boolean;
}
